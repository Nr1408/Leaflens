import importlib.util
print('fastapi:', importlib.util.find_spec('fastapi') is not None)
print('uvicorn:', importlib.util.find_spec('uvicorn') is not None)
