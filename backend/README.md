# Backend Setup

## Create virtual environment (optional)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run backend server
```bash
python manage.py runserver
```

## Install PostgreSQL (not in venv)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

# Start PostgresSQL server
**Run this command outside of venv if you're using it**
```bash
sudo service postgresql start
```
Next activate your venv
```bash
source venv/bin/activate
pip install -r requirements.txt
```
Run server
```bash
python manage.py runserver
```
