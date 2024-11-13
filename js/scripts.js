const username = 'coalition';
const password = 'skills-test';
const myHeaders = new Headers();
myHeaders.append('Authorization', `Basic ${btoa(`${username}:${password}`)}`);

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
};

// Fetch patients data and display the list
fetch('https://fedskillstest.coalitiontechnologies.workers.dev', requestOptions)
  .then((response) => response.json())
  .then((patients) => {
    listPatients(patients);
  })
  .catch((error) => console.error('Error fetching patients:', error));

function displayPatientData(patient) {
  // Ensure requestOptions is defined
  if (!requestOptions) {
    console.error('requestOptions is not defined.');
    return;
  }
  
  fetch(`https://fedskillstest.coalitiontechnologies.workers.dev/patients/${patient.index}/blood_pressure`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('Unexpected data format. Expected an array.');
        return;
      }
      
      // Find the selected patient's data
      const patientData = data.find(p => p.name === patient.name);
      console.log(patientData);
      
      if (!patientData || !patientData.diagnosis_history) {
        console.error('No blood pressure data found for patient');
        return;
      }

      // Sort diagnosis history by date
      const sortedHistory = patientData.diagnosis_history.sort((a, b) => {
        const dateA = new Date(`${a.month} ${a.year}`);
        const dateB = new Date(`${b.month} ${b.year}`);
        return dateA - dateB;
      });

      // Extract blood pressure data - limit to last 12 months
      const limitedHistory = sortedHistory.slice(-12);
      const labels = limitedHistory.map(record => `${record.month.slice(0, 3)} ${record.year}`);
      const systolicData = limitedHistory.map(record => record.blood_pressure.systolic?.value || 0);
      const diastolicData = limitedHistory.map(record => record.blood_pressure.diastolic?.value || 0);

      // Get the canvas element
      const canvas = document.getElementById('bloodPressureChart');
      const ctx = canvas.getContext('2d');

      // Destroy existing chart if it exists
      if (window.bloodPressureChart instanceof Chart) {
        window.bloodPressureChart.destroy();
      }

      
      window.bloodPressureChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Systolic',
              data: systolicData,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            },
            {
              label: 'Diastolic',
              data: diastolicData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true
            },
            title: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                drawBorder: false
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            }
          },
          elements: {
            line: {
              tension: 0.4
            },
            point: {
              radius: 4,
              hoverRadius: 6
            }
          }
        }
      });
    })
    .catch((error) => {
      console.error('Error fetching blood pressure data:', error);
    });

  // Display diagnosis list
  displayDiagnosisList(patient.diagnostic_list);
  
  // Display lab results
  displayLabResults(patient.lab_results);

  // Display other patient data
  const patientInfo = document.getElementById('patient-info');
  patientInfo.innerHTML = `
    <img src="${patient.profile_picture}" alt="${patient.name}" class="w-40 h-40 rounded-full mx-auto mb-4" />
    <p class="text-center font-bold text-lg">${patient.name}</p>
    <p class="flex items-center"><img src="images/BirthIcon@2x.png" alt="Calendar" class="w-8 h-full inline mr-2"><span class="inline-flex flex-col text-sm">
        <span>Date of Birth:</span>
        <span class="font-semibold ml-[88px]">${patient.date_of_birth}</span>
      </span></p>
    <p class="flex items-center"><img src="images/FemaleIcon@2x.png" alt="Gender" class="w-8 h-full inline mr-2"><span class="inline-flex flex-col text-sm">
        <span>Gender:</span>
        <span class="font-semibold ml-[88px]">${patient.gender}</span>
      </span></p>
    <p class="flex items-center"><img src="images/PhoneIcon@2x.png" alt="Phone" class="w-8 h-full inline mr-2"><span class="inline-flex flex-col text-sm">
        <span>Contact Info:</span>
        <span class="font-semibold ml-[88px]">${patient.phone_number}</span>
      </span></p>
    <p class="flex items-center"><img src="images/PhoneIcon@2x.png" alt="Emergency" class="w-8 h-full inline mr-2"><span class="inline-flex flex-col text-sm">
        <span>Emergency Contact:</span>
        <span class="font-semibold ml-[88px]">${patient.emergency_contact}</span>
      </span></p>
    <p class="flex items-center"><img src="images/InsuranceIcon@2x.png" alt="Insurance" class="w-8 h-full inline mr-2"><span class="inline-flex flex-col text-sm">
        <span>Insurance provider:</span>
        <span class="font-semibold ml-[88px]">${patient.insurance_type}</span>
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

  patientList.innerHTML = displayedPatients.map((patient) => `
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
  document.querySelectorAll('.patient-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      const patient = JSON.parse(item.getAttribute('data-patient'));
      // Add index to patient object
      patient.index = index + 1; // 1-based index
      displayPatientData(patient);
      
      // Highlight selected patient
      document.querySelectorAll('.patient-item').forEach(p => p.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
}

function displayDiagnosisList(diagnosticList) {
  const diagnosisList = document.getElementById('diagnosis-list');

  if (!diagnosticList || !Array.isArray(diagnosticList)) {
    diagnosisList.innerHTML = '<li class="p-2">No diagnosis records found</li>';
    return;
  }

  diagnosisList.innerHTML = diagnosticList.map((diagnosis) => `
    <li class="flex flex-col">
      <div class="flex justify-between items-center p-2 hover:bg-gray-100">
        <div class="w-1/3">
          <p class="font-semibold">${diagnosis.name}</p>
        </div>
        <div class="w-1/3">
          <p class="text-sm text-gray-600">${diagnosis.description}</p>
        </div>
        <div class="w-1/3">
          <span class="text-sm ${getStatusColor(diagnosis.status)}">${diagnosis.status}</span>
        </div>
      </div>
    </li>
  `).join('');
}

function getStatusColor(status) {
  const statusColors = {
    Active: 'text-red-500',
    Inactive: 'text-gray-500',
    Cured: 'text-green-500',
    Untreated: 'text-yellow-500',
    'Under Observation': 'text-yellow-500',
  };
  return statusColors[status] || 'text-gray-500';
}

function displayLabResults(labResults) {
  const labResultsList = document.getElementById('lab-results-list');

  if (!labResults || !Array.isArray(labResults)) {
    labResultsList.innerHTML = '<li class="p-2">No lab results found</li>';
    return;
  }

  labResultsList.innerHTML = labResults.map((testName) => `
    <li class="flex flex-col mb-4 bg-white rounded-lg shadow">
      <div class="flex justify-between items-center p-4">
        <div class="flex-1">
          <p class="font-semibold text-gray-800">${testName}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            onclick="viewTestDetails('${testName}')"
          >
            <img src="/images/download@2x.png" alt="View Details" class="w-4 h-4"/>
          </button>
        </div>
      </div>
    </li>
  `).join('');
}

function pickVitalSign(apiData) {
  const vitalSigns = ['Respiratory rate', 'Temperature', 'Heart Rate'];
  for (let i = 0; i < vitalSigns.length; i++) {
    if (apiData[vitalSigns[i]]) {
      const vitalSignValue = apiData[vitalSigns[i]];
      document.getElementById('vital-sign').textContent = vitalSignValue;
      return vitalSignValue;
    }
  }
  document.getElementById('vital-sign').textContent = 'No vital signs available';
  return null;
}

function updateRespiratoryRate(apiData) {
  const respiratoryRate = apiData['Respiratory rate'] || 'N/A';
  const unit = respiratoryRate !== 'N/A' ? ' bpm' : '';
  document.getElementById('respiratory-rate').textContent = respiratoryRate + unit;
}



// Update displayPatientData to include diagnosis list
const originalDisplayPatientData = displayPatientData;
displayPatientData = (patient) => {
  originalDisplayPatientData(patient);
  displayDiagnosisList(patient.diagnostic_list);
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initial fetch of patients data happens automatically when the script loads
});
