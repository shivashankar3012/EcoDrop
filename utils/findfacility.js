const Facility = require("../models/partner.js"); // Import your Facility model
const nodemailer = require('nodemailer');
const customerPartner = require("../models/customerPartner.js");

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1); // Difference in latitude
    const dLng = deg2rad(lng2 - lng1); // Difference in longitude
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}


// Function to get the nearest facility and send an email
async function getnearestfacility(customer, customerLat, customerLng) {
    try {
        const facilities = await Facility.find(); // Retrieve all facilities from the database
        
        // console.log("Customers: "+customerLat + " " + customerLng);

        if (!facilities || facilities.length === 0) {
            console.log('No facilities found.');
            return;
        }

        // const { lat: customerLat, lng: customerLng } = customer.address; // Extract lat and lng from customer address

        let nearestFacility = null;
        let minDistance = Infinity;
        // console.log(customerLat + " " + customerLng);
        facilities.forEach(facility => {
            const distance = getDistanceFromLatLonInKm(
                customerLat,
                customerLng,
                facility.geometry.coordinates[0],
                facility.geometry.coordinates[1]
            );
            // console.log(distance + " " + facility.email);
            if (distance < minDistance) {
                minDistance = distance;
                // console.log("mindis "+ minDistance);
                nearestFacility = facility;
                // console.log(minDistance + " " + nearestFacility.email);
                // console.log(nearestFacility.email +" "+ minDistance);
            }
        });

        if (nearestFacility) {
            // Send an email to the nearest facility
            sendEmailToNearestFacility(customer, nearestFacility);

        } else {
            console.log('No nearby facility found.');
        }
    } catch (error) {
        console.error('Error finding nearest facility:', error);
    }
    // return nearestFacility;
}

// Function to send an email to the nearest facility
async function sendEmailToNearestFacility(customer, nearestFacility) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ecodrop.gogreen@gmail.com',
            pass: 'bcth rtss kirz fbxm'
        }
    });

    const mailOptions = {
        from: 'ecodrop.gogreen@gmail.com',
        to: nearestFacility.email,
        subject: 'From EcoDrop New E-Waste Pickup Request',
        text: `Hello ${nearestFacility.facilityname} have a new e-waste pickup request from a customer.\n\nCustomer Details:\nName: ${customer.firstname} ${customer.lastname}\nAddress: ${customer.address}\nPhone: ${customer.contact}\nEmail: ${customer.email}\nE-Waste: ${customer.ewaste}\nPlease contact the customer to arrange pickup.`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response + " " + nearestFacility.email);
        }
    });
    if(customer.businessname && customer.businessname.length > 1){
        const newcustomerPartner = new customerPartner({
            partneremail: nearestFacility.email,
            businessname: customer.businessname,
            customername: customer.firstname + " " + customer.lastname,
            customeremail: customer.email,
            customerewaste: customer.ewaste,
            customeraddress: customer.address
        });
        console.log(newcustomerPartner);
        await newcustomerPartner.save();
    }else{
        const newcustomerPartner = new customerPartner({
            partneremail: nearestFacility.email,
            customername: customer.firstname + " " + customer.lastname,
            customeremail: customer.email,
            customerewaste: customer.ewaste,
            customeraddress: customer.address
        });
        await newcustomerPartner.save();
    }
}
module.exports = getnearestfacility;