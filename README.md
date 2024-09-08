### CM2020 Agile Software Development Final Deliverables ###

#### Installation requirements ####

* NodeJS 
    - follow the install instructions at https://nodejs.org/en/
* Sqlite3 
    - follow the instructions at https://www.tutorialspoint.com/sqlite/sqlite_installation.htm 
    - Note that the latest versions of the Mac OS and Linux come with SQLite pre-installed

#### Running this Project ####

To get started:

* Run ```npm install``` from the project directory to install all the node packages.

* Run ```npm run build-db``` to create the database on Mac or Linux 
or run ```npm run build-db-win``` to create the database on Windows

* Run ```node index.js``` to start serving the web app (Access via http://localhost:3000)

You can also run: 
```npm run clean-db``` to delete the database on Mac or Linux before rebuilding it for a fresh start

#### Navigating through this Application ####

This application is a web-based booking system, as a booking system user, you can: 
* Access through /user route main page
* Make reservation (input office, time, and duration for availabity check)
* Search & Delete an existing reservation 

as a booking system manager, you can:
* Access through /manager route main page
* Add new Office location 
* View all reservations 
