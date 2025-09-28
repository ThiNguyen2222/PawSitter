# Backend Setup

## Create virtual environment
For Mac
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
For Windows
```bash
python3 -m venv venv
venv/bin/activate
pip install -r requirements.txt
```

## Install PostgreSQL (not in venv)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
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

