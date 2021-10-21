##
## -------------
## | MRH (application) |
## -------------
##

# The special prefix characters ('@' and '-') control the behaviour of make for the tagged command lines:
# 	'@' => suppresses the normal 'echo' of the command that is executed.
# 	'-' => means ignore the exit status of the command that is executed (normally, a non-zero exit status would stop that part of the build).

CURR_DATE := $(shell date +%Y%m%dT%H%M%S)
RANDOM := $(shell bash -c 'echo $$RANDOM')
DOCKER_COMPOSE  = docker-compose
DOCKER  = docker
USER =  --user $$(id -u):$$(id -g)
DOCKER_COMPOSE_RUN  = $(DOCKER_COMPOSE) run $(USER)
DOCKER = docker
GIT = git
MIGRATION_NAME ?= migration
BACK_CONTAINERS = backend-database-mrh backend-api-mrh adminer pgadmin
FRONT_CONTAINERS = frontend-mrh
ADMIN_CONTAINERS = admin-mrh 
STORYBOOK_CONTAINERS = storybook-mrh

all: help

TARGET_MAX_CHAR_NUM=28

.PHONY: help
#%% Show help
help:
	@echo ''
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^#%% (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  %-$(TARGET_MAX_CHAR_NUM)s %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)


## --- Docker - install ---

.PHONY: install
#%% install project
install: pull-docker-images y-i-all

.PHONY: pull-docker-images
#%% Pull images
pull-docker-images:
	$(DOCKER_COMPOSE) pull

.PHONY: start
#%% Create and start containers
start:
	$(DOCKER_COMPOSE) up --remove-orphans -d backend-api-sp-auth mailhog-sp-auth adminer

.PHONY: stop
#%% stop containers
stop:
	$(DOCKER_COMPOSE) stop

	

.PHONY: test-back
#%% run test for backend
test-back:
	@echo "| Run test for backend service |"
	$(DOCKER_COMPOSE) run --rm e2e-test-backend-api-sp-auth yarn jest --color

.PHONY: down
#%% Create and start containers
down:
	$(DOCKER_COMPOSE) down

.PHONY: kill
#%% kill containers
kill:
	$(DOCKER_COMPOSE) kill

.PHONY: clear
#%% kill containers
clear: kill
	$(DOCKER_COMPOSE) down -v

.PHONY: logs
#%% View output from containers
logs:
	$(DOCKER_COMPOSE) logs -f


## --- Docker - install dependencies ---

.PHONY: y-i-all
#%% install dependencies for **_ALL_** dependencies
y-i-all: y-i-back

.PHONY: y-i-back
#%% install dependencies for back
y-i-back:
	@echo "| Install back dependencies |"
	$(DOCKER_COMPOSE) run --rm --no-deps backend-api-sp-auth yarn install
	@echo "| Back dependencies installed |"

.PHONY: lint-back
#%% linter for back
lint-back:
	@echo "| Linter back start |"
	$(DOCKER_COMPOSE) run --rm --no-deps backend-api-sp-auth yarn lint
	@echo "| Linter back finish |"

.PHONY: lint-fix-back
#%% linter fix for back
lint-fix-back:
	@echo "| Linter fix back start |"
	$(DOCKER_COMPOSE) run --rm --no-deps backend-api-sp-auth yarn lint:fix
	@echo "| Linter fix back finish |"

.PHONY: db-generate-migration
#%% generate migration, put MIGRATION_NAME={YOUR_NAME} in this command to custom the migration name
db-generate-migration:
	@echo "| Generate new migration database |"
	$(DOCKER_COMPOSE_RUN) --rm backend-api-sp-auth yarn migration:generate -n $(MIGRATION_NAME)
	@echo "| Migration database generated |"

	
.PHONY: db-migrate-run
#%% run migrations for dev database
db-migrate-run:
	@echo "| Run migrations for dev database |"
	$(DOCKER_COMPOSE_RUN) --rm backend-api-sp-auth yarn migration:run
	@echo "| Finish run migrations for dev database |"

.PHONY: db-migrate-run-e2e
#%% run migrations for e2e test database
db-migrate-run-e2e:
	@echo "| Run migrations for e2e tests database |"
	$(DOCKER_COMPOSE_RUN) --rm e2e-test-backend-api-sp-auth yarn migration:run
	@echo "| Finish run migrations for e2e tests database |"


# %: - rule which match any task name;
# @: - empty recipe = do nothing
%:
  @:
