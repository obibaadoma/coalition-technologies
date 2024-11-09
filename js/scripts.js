const username = 'coalition';
const password = 'skills-test';
const myHeaders = new Headers();
myHeaders.append('Authorization', `Basic ${btoa(`${username}:${password}`)}`);

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

// Fetch patients data and display the list
fetch('https://fedskillstest.coalitiontechnologies.workers.dev', requestOptions)
  .then(response => response.json())
  .then(patients => {
    listPatients(patients);
  })
  .catch(error => console.error('Error fetching patients:', error));

function displayPatientData(patient) {
  // Fetch graph data for the selected patient
  fetch(`https://fedskillstest.coalitiontechnologies.workers.dev/graph/${patient.id}`, requestOptions)
    .then(response => response.json())
    .then(graphData => {
      const ctx = document.getElementById('bloodPressureChart');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: graphData.dates,
          datasets: [
            {
              label: 'Blood Pressure',
              data: graphData.values,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Patient Blood Pressure Trends'
            },
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Blood Pressure (mmHg)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            }
          }
        }
      });
    })
    .catch(error => console.error('Error fetching graph data:', error));

  // Display other patient data
  const patientInfo = document.getElementById('patient-info');
  patientInfo.innerHTML = `
    <img src="${patient.profile_picture}" alt="${patient.name}" class="w-10 h-10 rounded-full mr-4" />
    <p><strong></strong> ${patient.name}</p>
    <p><strong>Date of Birth:</strong> ${patient.date_of_birth}</p>
    <p><strong>Gender:</strong> ${patient.gender}</p>
    <p><strong>Contact Info:</strong> ${patient.phone_number}</p>
    <p><strong>Emergency Contact:</strong> ${patient.emergency_contact}</p>
    <p><strong>Insurance provider:</strong> ${patient.insurance_type}</p>
  `;
}

function listPatients(patientsData) {
  const patientList = document.getElementById('patient-list');
  if (!patientsData || !Array.isArray(patientsData)) {
    patientList.innerHTML = '<li>No patients found</li>';
    return;
  }

  // Only display first 12 patients
  const displayedPatients = patientsData.slice(0, 12);

  patientList.innerHTML = displayedPatients.map(patient => `
    <li class="patient-item cursor-pointer p-4 hover:bg-gray-100 border-b" data-patient='${JSON.stringify(patient)}'>
      <div class="flex items-center">
        <img src="${patient.profile_picture || 'images/default-avatar.png'}" alt="${patient.name}" class="w-10 h-10 rounded-full mr-4">
        <div>
          <h3 class="font-semibold">${patient.name}</h3>
          <p class="text-sm text-gray-600"> ${patient.gender}, ${patient.age}</p>
        </div>
      </div>
    </li>
  `).join('');

  // Add event listeners to the list items
  document.querySelectorAll('.patient-item').forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      document.querySelectorAll('.patient-item').forEach(i => i.classList.remove('bg-blue-50'));
      // Add active class to clicked item
      item.classList.add('bg-blue-50');
      
      const patient = JSON.parse(item.getAttribute('data-patient'));
      displayPatientData(patient);
    });
  });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initial fetch of patients data happens automatically when the script loads
});
