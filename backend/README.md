# Backend Setup

## Create virtual environment
**Mac / Linux**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
**For Windows(Command Prompt)**
```bash
python3 -m venv venv
venv/bin/activate
pip install -r requirements.txt
```

## Install PostgreSQL (not in venv)
**Mac / Linux**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

**Windows**
- Download installer: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- During setup:
  - Keep default port `5432`
  - Set a password for the `postgres` superuser
  - Ensure **pgAdmin** is installed
- PostgreSQL will run as a Windows service automatically.


## How to Test

### Mac / Linux

1. **Start PostgreSQL**
**Run this command outside of venv**
```bash
sudo service postgresql start
```
2. **Activate your venv**
```bash
source venv/bin/activate
pip install -r requirements.txt
```
3. **Create a Database**
```bash
sudo -u postgres psql
CREATE DATABASE pawsitter_db;
\q
```
4. **Apply migrations**
```bash
python3 manage.py makemigrations
python3 manage.py migrate
```
5. **Run server** 
```bash
python3 manage.py runserver
```

### Windows(Command Prompt)

1. **Start PostgreSQL:**
PostgreSQL runs automatically as a Windows service.
2. **Activate your venv**
```bash
venv\Scripts\activate.bat
pip install -r requirements.txt
```
3. **Create a Database**
```bash
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -c "CREATE DATABASE pawsitter_db;"
```
4. **Apply migrations**
```bash
python3 manage.py makemigrations
python3 manage.py migrate
```
5. **Run server** 
```bash
python3 manage.py runserver
```


