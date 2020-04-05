import os
from dotenv import load_dotenv


class Configuration:
    def __init__(self):
        load_dotenv(verbose=True)
        self._api_host = self._get_string_env('API_HOST')
        self._api_port = self._get_int_env('API_PORT')
        self._api_login = self._get_string_env('API_LOGIN')
        self._api_token = self._get_string_env('API_TOKEN')

    @property
    def api_host(self) -> str:
        return self._api_host

    @property
    def api_login(self) -> str:
        return self._api_login

    @property
    def api_token(self) -> str:
        return self._api_token

    @property
    def api_port(self) -> int:
        return self._api_port

    @staticmethod
    def _get_int_env(env_name: str) -> int:
        value = Configuration._get_string_env(env_name)
        return int(value)

    @staticmethod
    def _get_string_env(env_name: str) -> str:
        if env_name in os.environ:
            return os.getenv(env_name)
        else:
            raise RuntimeError('Missing required environment variable "{}"'.format(env_name))