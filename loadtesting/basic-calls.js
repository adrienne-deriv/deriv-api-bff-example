import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:8080/api/v1";

// const BASE_URL = "https://deriv-dev.outsystems.app/AdrienneTestAPIUnofficial/rest/benchmark"

const params = {
  headers: {
    "Cache-Control": "max-age=900",
  },
};

const urls = [
  "/residence_list?app_id=1000001",
  "/website_status?app_id=1000001",
  "/aggregated-calls?app_id=1000001",
];

// const stages = [
//   { duration: "1m", target: 10 },
//   { duration: "2m", target: 20 },
//   { duration: "3m", target: 30 },
//   { duration: "2m", target: 20 },
//   { duration: "1m", target: 10 },
//   { duration: "1m", target: 0 },
// ];

// const stages = [
//     { duration: "1m", target: 10 },
//     { duration: "2m", target: 20 },
//     { duration: "3m", target: 20 },
//     { duration: "2m", target: 10 },
//     { duration: "1m", target: 0 },
//   ];

// const stages = [
//   { duration: "30s", target: 5 },
//   { duration: "30s", target: 10 },
//   { duration: "30s", target: 20 },
//   { duration: "30s", target: 50 },
//   { duration: "30s", target: 30 },
//   { duration: "30s", target: 20 },
//   { duration: "30s", target: 0 },
// ];

// const stages = [
//     { duration: "30s", target: 10 },
//     { duration: "30s", target: 50 },
//     { duration: "1m", target: 100 },
//     { duration: "1m", target: 200 },
//     { duration: "1m", target: 300 },
//     { duration: "1m", target: 500 },
//     { duration: "1m", target: 100 },
//     { duration: "1m", target: 50 },
//     { duration: "30s", target: 0 },
// ];

const stages = [
  { duration: "30s", target: 10 },
  { duration: "30s", target: 50 },
  { duration: "1m", target: 100 },
  { duration: "1m", target: 200 },
  { duration: "1m", target: 300 },
  { duration: "1m", target: 500 },
  { duration: "2m", target: 1000 },
  { duration: "1m", target: 500 },
  { duration: "1m", target: 200 },
  { duration: "1m", target: 50 },
  { duration: "30s", target: 0 },
];

export let options = {
  stages,
};

export default async function () {
  await http.get(`${BASE_URL}/`);
}
