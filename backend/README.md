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
```bash
- Download installer: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- During setup:
  - Keep default port `5432`
  - Set a password for the `postgres` superuser
  - Ensure **pgAdmin** is installed
- PostgreSQL will run as a Windows service automatically.
```

## How to Test
**Run this command outside of venv**
```bash
sudo service postgresql start
```
Next activate your venv
```bash
source venv/bin/activate
pip install -r requirements.txt
```
Create a Database
```bash
sudo -u postgres psql
CREATE DATABASE pawsitter_db;
\q
```
Apply migrations
```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

Run server 
```bash
python3 manage.py runserver
```

