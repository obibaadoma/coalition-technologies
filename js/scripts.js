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
  const ctx = document.getElementById('bloodPressureChart');
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
  if (!patientsData || !Array.isArray(patientsData)) {
    patientList.innerHTML = '<li>No patients found</li>';
    return;
  }

  patientList.innerHTML = patientsData.map(patient => `
    <li class="patient-item cursor-pointer p-4 hover:bg-gray-100 border-b" data-patient='${JSON.stringify(patient)}'>
      <div class="flex items-center">
        <img src="${patient.profile_picture || 'images/default-avatar.png'}" alt="${patient.name}" class="w-10 h-10 rounded-full mr-4">
        <div>
          <h3 class="font-semibold">${patient.name}</h3>
          <p class="text-sm text-gray-600"> ${patient.gender}, ${patient.
            age
            }</p>
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
