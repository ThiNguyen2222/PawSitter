# Backend Setup

## Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Install PostgreSQL (not in venv)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

## Start PostgresSQL server (haven't actually created the django files for this yet)
**Run this command outside of venv**
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
