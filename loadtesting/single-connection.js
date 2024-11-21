import ws from "k6/ws";
import { check, sleep } from "k6";
import { Counter, Trend, Gauge } from "k6/metrics";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import redis from "k6/experimental/redis";
import { getCurrentStageIndex } from "https://jslib.k6.io/k6-utils/1.3.0/index.js";
// A counter for the number of messages sent
const counterSent = new Counter("ws_messages_sent");
const counterRecived = new Counter("ws_messages_received");
// const counterConnectionsAlive = new Gauge("ws_connections_alive");

let REQUEST_INTERVAL_MS = 500;
let WS_CLOSE_TIMEOUT_SECONDS = 5;
let WS_GRACEFUL_CLOSE_SECONDS = 10;

// Single connection, high request rate
REQUEST_INTERVAL_MS = 50;
const stages = [
  { duration: "30s", target: 1 },
  {
    duration: `${WS_CLOSE_TIMEOUT_SECONDS + WS_GRACEFUL_CLOSE_SECONDS}s`,
    target: 0,
  },
];

const wsMessageTimeTrend = new Trend("ws_total_message_time", true);

const wsResidenceListTimeTrend = new Trend("k6_ws_residence_list_time", true);

const wsWebsiteStatusTimeTrend = new Trend("ws_website_status_time", true);

const wsAggregateTimeTrend = new Trend("ws_aggregate_time", true);

export let options = {
  scenarios: {
    load_testing: {
      executor: "ramping-vus",
      stages,
      gracefulRampDown: "0s",
    },
  },
};

export default async function () {
  const url = "ws://localhost:8080/";
  const params = { tags: { my_tag: "hello" } };

  const client = await new redis.Client("redis://localhost:6379");
  const userId = __VU;

  const hasKey = await client.exists(userId);
  if (hasKey) {
    const isDone = await client.get(userId);
    if (isDone) {
      sleep(1000);
      return;
    }
  } else {
    await client.set(userId, true);
  }

  const res = ws.connect(url, params, function (socket) {
    let startMessageTime = new Date().getTime();

    let wsCloseTimeout;
    const wsCheckDoneInterval = socket.setInterval(() => {
      const currentStage = getCurrentStageIndex();
      if (currentStage === stages.length - 1) {
        wsCloseTimeout = socket.setTimeout(
          () => socket.close(),
          WS_CLOSE_TIMEOUT_SECONDS * 1000
        );
      }
    }, 1000);

    socket.on("open", () => {
      console.log(`Virtual user ${__VU} initialised a Websocket connection`);
      // counterConnectionsAlive.add(1);
      // Send as many messages as possible
      socket.setInterval(() => {
        const requestId = uuidv4();
        startMessageTime = new Date().getTime();
        socket.send(
          JSON.stringify({
            method: "bench-residence-list",
            passthrough: {
              key: requestId,
              startTime: startMessageTime,
            },
          })
        );
        socket.send(
          JSON.stringify({
            method: "bench-website-status",
            passthrough: {
              key: requestId,
              startTime: startMessageTime,
            },
          })
        );
        socket.send(
          JSON.stringify({
            method: "bench",
            passthrough: {
              key: requestId,
              startTime: startMessageTime,
            },
          })
        );
        counterSent.add(3);
      }, REQUEST_INTERVAL_MS);
    });

    socket.on("message", (data) => {
      // time the response immediately
      const currentTime = new Date().getTime();

      const response = JSON.parse(data);

      const passthrough = response.echo.passthrough;
      const msgType = response.msg_type;

      const messageTime = currentTime - passthrough.startTime;
      counterRecived.add(1);
      wsMessageTimeTrend.add(messageTime, {
        type: msgType,
      }); // Record it in the trend
      switch (msgType) {
        case "bench":
          wsAggregateTimeTrend.add(messageTime);
          break;
        case "bench-website-status":
          wsWebsiteStatusTimeTrend.add(messageTime);
          break;
        case "bench-residence-list":
          wsResidenceListTimeTrend.add(messageTime);
          break;
      }
    });
    socket.on("close", () => {
      console.log(`Virtual user ${__VU} is closing the conenction`);
      // counterConnectionsAlive.add(-1);
      clearInterval(wsCheckDoneInterval);
      clearTimeout(wsCloseTimeout);
    });
  });

  check(res, { "status is 101": (r) => r && r.status === 101 });
}
