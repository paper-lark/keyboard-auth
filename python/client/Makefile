.PHONY: all start venv_freeze venv_create clean build

proto_srcs = proto/authenticator.proto
proto_compiled = src/api/__generated__/authenticator_pb2.py src/api/__generated__/authenticator_pb2_grpc.py
entry_point = main.py

all: $(proto_compiled)

$(proto_compiled): $(proto_srcs)
	@echo "Compiling proto files"
	python -m grpc_tools.protoc -I./proto --python_out=src/api/__generated__ --grpc_python_out=src/api/__generated__ $(proto_srcs)
	sed -i '' 's/import authenticator_pb2/from . import authenticator_pb2/g' $(proto_compiled)

start: $(proto_compiled)
	@echo 'Starting application'
	@sudo python $(entry_point)

venv_freeze:
	pip freeze > requirements.txt

venv_create:
	python3 -m venv venv
	source venv/bin/activate && pip install -r requirements.txt

build: $(proto_compiled)
	pyinstaller --onefile $(entry_point)

clean:
	rm $(proto_compiled)
