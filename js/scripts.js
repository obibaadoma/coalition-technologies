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
    <img src="${patient.profile_picture}" alt="${patient.name}" class="w-40 h-40 rounded-full mx-auto mb-4" />
    <p class="text-center font-bold text-xl">${patient.name}</p>
    <p><img src="images/BirthIcon@2x.png" alt="Calendar" class="w-4 h-4 inline mr-2"><span class="inline-flex flex-col">
        <span>Date of Birth:</span>
        <span class="text-sm font-semibold ml-[88px]">${patient.date_of_birth}</span>
      </span></p>
    <p><img src="images/FemaleIcon@2x.png" alt="Gender" class="w-4 h-4 inline mr-2"><span class="inline-flex flex-col">
        <span>Gender:</span>
        <span class="text-sm font-semibold ml-[88px]">${patient.gender}</span>
      </span></p>
    <p><img src="images/PhoneIcon@2x.png" alt="Phone" class="w-4 h-4 inline mr-2"><span class="inline-flex flex-col">
        <span>Contact Info:</span>
        <span class="text-sm font-semibold ml-[88px]">${patient.phone_number}</span>
      </span></p>
    <p><img src="images/PhoneIcon@2x.png" alt="Emergency" class="w-4 h-4 inline mr-2"><span class="inline-flex flex-col">
        <span>Emergency Contact:</span>
        <span class="text-sm font-semibold ml-[88px]">${patient.emergency_contact}</span>
      </span></p>
    <p><img src="images/InsuranceIcon@2x.png" alt="Insurance" class="w-4 h-4 inline mr-2"><span class="inline-flex flex-col">
        <span>Insurance provider:</span>
        <span class="text-sm font-semibold ml-[88px]">${patient.insurance_type}</span>
      </span></p>
    <br>
    <br>
    
    <button class="w-[220px] h-[41px] rounded-full bg-[blue] text-black">Show all information</button>
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
