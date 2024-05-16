# com3504
For Intelligent Web
# com3504 The Intelligent Web Assignment: CactHi

## Team Members
1. Ethan Watts
2. Daniel St-Gallay
3. Lucy Slater
4. M Tahir Khan

## Introduction
This repository contains the code for the Intelligent Web Assignment for the COM3504 module at the University of Sheffield. The assignment is to create a progressive web application for "Plant Recognition" which could fascilitate recording and viewing of plant species. The application promotes community engagement, learning about plant species, sharing knowledge, and helping to identify plants in the wild.

## Dependencies
* Node.JS
* MongoDB
* Standard Node Modules

## Installation
1. Clone the repository
2. Start the MongoDB server on port 27017
2. Run `npm install` to install the dependencies
3. Run `npm start` to start the server
4. Open a browser and navigate to `http://localhost:3000` to surf the application

## Features
1. Landing Page for entering the application with your username
2. Home Page with a brief description of the application
3. Create a new plant sighting with the plant information, live geolocation, and option to upload or capture the plant image with the device's camera
4. View all the plant sightings with the plant information, location, and image and the ability to filter the sightings by closest distance, farthest distance, earliest seen, latest seen, identification status, and plant features. Also, the ability to sort the sightings by the plant created by the current user
5. View a particular plant sighting in more details
6. Chat Room for the users to discuss plant species, sightings, and identification of a particular plant
7. Plant name suggestions for identification, and approval by the plant creator
8. Fetching information from DBpedia when viewing a particular plant, including: plant description, common name and the URI
9. Offline support for the application, with the ability to create, view plant sightings, and send messages in the chat room of a particular plant sighting without an internet connection
