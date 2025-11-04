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
python manage.py runserver
```

### Create Dummy Users + Tags/Specialities
``` bash
cd PawSitter/backend/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
sudo service postgresql start
psql -U postgres
CREATE DATABASE pawsitter_db;
\q
python manage.py makemigrations
python manage.py migrate
python manage.py seed_tags_specialties
python manage.py create_dummy_data --owners 10 --sitters 15  [can change numbers to any amount]
python manage.py runserver
```
## Create Superuser for Admin Access
- Access admin control: http://127.0.0.1:8000/admin/
- See data or change it here
``` bash
python manage.py createsuperuser
```
Enter credentials:
```
Username: admin
Email: admin@example.com
Password: admin123
Password (again): admin123
```
## Verifiy Dummy Data or Use Superuser
- Don't need to do this if you did the superuser
- Checking if dummy data was created successfully and there is the correct amount
- Should be 25 tags and 20 specialties; Users/Owners/Sitters should be the amount you put in the command
- If there is more than expected you might want to delete the unwanted data to keep development clean
``` bash
python manage.py shell
from django.contrib.auth import get_user_model
from profiles.models import OwnerProfile, SitterProfile, Tag, Specialty
User = get_user_model()

# Check counts
print(f"Users: {User.objects.count()}")
print(f"Owners: {OwnerProfile.objects.count()}")
print(f"Sitters: {SitterProfile.objects.count()}")
print(f"Tags: {Tag.objects.count()}")
print(f"Specialties: {Specialty.objects.count()}")

# Exit
exit()
```
