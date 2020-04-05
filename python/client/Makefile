.PHONY: all venv_freeze clean

proto_srcs = proto/authenticator.proto
proto_compiled = src/api/__generated__/authenticator_pb2.py src/api/__generated__/authenticator_pb2_grpc.py

all: $(proto_compiled)

$(proto_compiled): $(proto_srcs)
	@echo "Compiling proto files"
	python -m grpc_tools.protoc -I./proto --python_out=src/api/__generated__ --grpc_python_out=src/api/__generated__ $(proto_srcs)
	sed -i '' 's/import authenticator_pb2/from . import authenticator_pb2/g' $(proto_compiled)

start: $(proto_compiled)
	@echo 'Starting application'
	@sudo python __init__.py

venv_freeze:
	pip freeze > requirements.txt

venv_create:
	python3 -m venv env
	source env/bin/activate
	pip install -r requirements.txt


clean:
	rm $(proto_compiled)
