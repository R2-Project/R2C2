api:
    host: 0.0.0.0
    port: 8080
operators:
    - username: anakin
      password: admin123
database_path: ../db/r2c2.db
jwt_secret: R2C2R0ck$!

# the directory where all the exfiltrated data will be stored
loot_path: ./loot

ai:
    provider: openai
    api_key: your_openai_api_key_here
    api_version: 2025-01-01-preview
    base_url: https://api.openai.com/v1
