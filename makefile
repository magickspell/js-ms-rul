start:
	docker compose up -d

stop:
	docker compose down
	docker volume rm rulim-js-user-microservice_mysql-data
	docker rmi rulim-js-user-microservice-app:latest
