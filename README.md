#EcoDrop
EcoDrop is a web application designed to help individuals and businesses manage their electronic waste (e-waste) responsibly. The platform connects users with nearby e-waste recycling facilities and provides an easy way for them to locate and deposit their e-waste. The goal of EcoDrop is to make e-waste recycling more accessible, reduce environmental harm, and promote sustainable waste disposal practices.

#Features
E-Waste Facility Locator: Users can find the nearest registered e-waste recycling facility based on their location.
Facility Registration: E-waste facilities can register on the platform to expand their reach and visibility.
Geolocation: Automatic conversion of addresses into geolocation coordinates (latitude and longitude) for accurate facility mapping.
User Accounts: E-waste facilities can create accounts to track their recycling history and manage their services.
Partner Program: Facilities can join the partner program to connect with potential customers and increase their visibility.
Educational Resources: Information about the importance of e-waste recycling and how the recycling process works is available for users.
Flash Messages: Real-time feedback to users for actions like login, registration, and submissions.
Error Handling: Robust error handling with informative messages for a seamless user experience.
Technologies Used
Node.js with Express for backend development
MongoDB for database management
EJS for server-side rendering
Passport.js for user authentication
OpenCage API for geocoding and location services
Mongoose for object data modeling (ODM)
Session and Flash middleware for user feedback
Axios for HTTP requests

#Installation
Clone the repository.
Install the required dependencies using npm install.
Set up a MongoDB database and update the mongoUrl in the configuration file.
Get an API key from OpenCage for geolocation services and add it to your environment variables.
Run the server using node app.js.

#Usage
Register as an individual or a recycling facility.
For individuals: Use the service to find the nearest e-waste recycling facility.
For facilities: Register your facility to be part of the EcoDrop platform and expand your customer base.
