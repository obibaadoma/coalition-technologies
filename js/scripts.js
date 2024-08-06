const { JSDOM } = require('jsdom');
const Chart = require('chart.js');
const fetch = require('node-fetch');

// Create a new JSDOM instance
const dom = new JSDOM(`<!DOCTYPE html>
<html>
<head>
  <title>Patient Data</title>
</head>
<body>
  <div id="patient-info"></div>
  <ul id="patient-list"></ul>
  <canvas id="bloodPressureChart" width="400" height="200"></canvas>
</body>
</html>`);

// Get the document object from the JSDOM instance
const document = dom.window.document;

// Polyfill for btoa in Node.js
const btoa = (str) => Buffer.from(str, 'binary').toString('base64');

// Your existing code
document.addEventListener("DOMContentLoaded", async () => {
  const apiEndpoint = 'https://fedskillstest.coalitiontechnologies.workers.dev';
  const username = 'coalition';
  const password = 'skills-test';
  const myHeaders = new dom.window.Headers({
    "Authorization": 'Basic ' + btoa(username + ':' + password)
  });

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch(apiEndpoint, requestOptions);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    console.log('Response data:', data);

    if (!data) {
      throw new Error('Patients data is missing in the response');
    }
    listPatients(data);

  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

function displayPatientData(patient) {
  const ctx = document.getElementById('bloodPressureChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: patient.bloodPressure.map(bp => bp.date),
      datasets: [
        {
          label: 'Systolic',
          data: patient.bloodPressure.map(bp => bp.systolic),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 1
        },
        {
          label: 'Diastolic',
          data: patient.bloodPressure.map(bp => bp.diastolic),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        subtitle: {
          display: true,
          text: 'Blood Pressure over Time'
        }
      }
    }
  });

  // Display other patient data
  const patientInfo = document.getElementById('patient-info');
  patientInfo.innerHTML = `
    <p><strong>Name:</strong> ${patient.name}</p>
    <p><strong>Date of Birth:</strong> ${patient.date_of_birth}</p>
    <p><strong>Gender:</strong> ${patient.gender}</p>
    <p><strong>Contact Info:</strong> ${patient.phone_number}</p>
    <p><strong>Emergency Contact:</strong> ${patient.emergency_contact}</p>
    <p><strong>Insurance provider:</strong> ${patient.insurance_type}</p>
  `;
}

function listPatients(patientsData) {
  const patientList = document.getElementById('patient-list');
  patientList.innerHTML = patientsData.map(patient => `
    <li class="patient-item" data-patient='${JSON.stringify(patient)}'>
      ${patient.name}
    </li>
  `).join('');

  // Add event listeners to the list items
  document.querySelectorAll('.patient-item').forEach(item => {
    item.addEventListener('click', () => {
      const patient = JSON.parse(item.getAttribute('data-patient'));
      displayPatientData(patient);
    });
  });
}

// Manually trigger the DOMContentLoaded event
const event = new dom.window.Event('DOMContentLoaded');
document.dispatchEvent(event);
  