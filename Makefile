test-constant-rate:
	docker compose restart redis && K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=results/constant-rate.html K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write k6 run -o experimental-prometheus-rw  ./loadtesting/constant-rate.js
test-burst-rate:
	docker compose restart redis && K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=results/burst-rate.html K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write k6 run -o experimental-prometheus-rw  ./loadtesting/burst-rate.js