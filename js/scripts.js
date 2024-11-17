const username = 'coalition';
const password = 'skills-test';
const myHeaders = new Headers();
myHeaders.append('Authorization', `Basic ${btoa(`${username}:${password}`)}`);

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
};

// Fetch all data at once and store patients globally
let patientsData = [];

fetch('https://fedskillstest.coalitiontechnologies.workers.dev', requestOptions)
  .then((response) => response.json())
  .then((patients) => {
    patientsData = patients;
    listPatients(patients);
  })
  .catch((error) => console.error('Error fetching patients:', error));

const displayPatientData = (patient) => {
  // Use the stored patient data instead of fetching again
  const patientData = patientsData.find((p) => p.name === patient.name);
  
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
  const labels = limitedHistory.map((record) => `${record.month.slice(0, 3)} ${record.year}`);
  const systolicData = limitedHistory.map((record) => record.blood_pressure.systolic?.value || 0);
  const diastolicData = limitedHistory.map((record) => record.blood_pressure.diastolic?.value || 0);

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
      labels,
      datasets: [
        {
          label: 'Systolic',
          data: systolicData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)', 
          borderWidth: 2,
          tension: 0.4,
          fill: false,
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
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          align: 'start',
          labels: {
            boxWidth: 2,
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            pointStyleWidth: 5,
            boxHeight: 5,
            boxWidth: 4,
            generateLabels: function(chart) {
              const datasets = chart.data.datasets;
              return datasets.map((dataset, i) => ({
                text: dataset.label + '\n' + (i === 0 
                        ? systolicData[systolicData.length - 1] 
                        : diastolicData[diastolicData.length - 1]), // Display value below each label
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i,
                datasetIndex: i,
                pointStyle: 'circle',
                textAlign: 'left', // Align text to the left
                padding: i === 0 ? { top: 2, bottom: 0 } : { top: 0, bottom: 0 }
              }));
            }            
          }
        },
        title: {
          display: true,
          text: 'Blood Pressure',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {
            top: 2,
            bottom: 20
          },
          align: 'start'
        },
      },
      layout: {
        padding: {
          top: 2,
          right: 0,
          left: 0 // Reduced left padding to shift y-axis closer to title
        }
      },
      scales: {
        y: {
          position: 'left',
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false,
            tickLength: 7
          },
          ticks: {
            font: {
              size: 12,
            },
            count: 7,
            padding: 4 // Reduced padding to move labels closer to axis
          },
          offset: false // Removes the gap between the axis and the data
        },
        x: {
          grid: {
            display: true, // Display horizontal lines
            drawOnChartArea: false, // Draw lines on the chart area
            drawBorder: false, // Do not draw border
            drawTicks: false, // Do not draw ticks
            color: 'rgba(0, 0, 0, 0.1)', // Set color of lines
            tickLength: 7, // Set length of ticks
          },
          ticks: {
            font: {
              size: 12,
            },
          },
          // Removed the afterFit function as it's not necessary
        },
      },
      elements: {
        line: {
          tension: 0.4,
        },
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
    },
  });

  // Display diagnosis list
  displayDiagnosisList(patient.diagnostic_list);
  
  // Display lab results
  displayLabResults(patient.lab_results);

  // Display vitals
  Vitals(patient.diagnosis_history);

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
};

const listPatients = (patients) => {
  const patientList = document.getElementById('patient-list');
  if (!patients || !Array.isArray(patients)) {
    patientList.innerHTML = '<li>No patients found</li>';
    return;
  }

  // Only display first 12 patients
 // const displayedPatients = patients.slice(0, 12);

  patientList.innerHTML = patients.map((patient) => `
    <li class="patient-item cursor-pointer p-4 hover:bg-gray-100" data-patient='${JSON.stringify(patient)}'>
      <div class="flex items-center">
        <img src="${patient.profile_picture || 'images/default-avatar.png'}" alt="${patient.name}" class="w-10 h-10 rounded-full mr-4">
        <div class="flex flex-col">
          <h3 class="font-semibold text-left">${patient.name}</h3>
          <p class="text-sm text-gray-600 text-left">${patient.gender}, ${patient.age}</p>
        </div>
        <img src="images/more_horiz_FILL0_wght300_GRAD0_opsz24.png" alt="settings" class="w-2 h-2 ml-auto">
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
      document.querySelectorAll('.patient-item').forEach((p) => p.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
};

const displayDiagnosisList = (diagnosticList) => {
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
};

const getStatusColor = (status) => {
  const statusColors = {
    Active: 'text-red-500',
    Inactive: 'text-gray-500',
    Cured: 'text-green-500',
    Untreated: 'text-yellow-500',
    'Under Observation': 'text-yellow-500',
  };
  return statusColors[status] || 'text-gray-500';
};

const displayLabResults = (labResults) => {
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
};

const Vitals = (diagnosisHistory) => {
  const vitalRate = document.getElementById('vital-rate');
  const temperature = document.getElementById('temperature');
  const heartRate = document.getElementById('heart-rate');

  if (!diagnosisHistory || diagnosisHistory.length === 0) {
    vitalRate.innerHTML = 'No vital data available';
    temperature.innerHTML = 'No vital data available';
    heartRate.innerHTML = 'No vital data available';
    return;
  }

  // Get most recent vital reading
  const latestVital = diagnosisHistory[diagnosisHistory.length - 1];
  
  // Display respiratory rate
  if (!latestVital.respiratory_rate) {
    vitalRate.innerHTML = 'No respiratory rate data available';
  } else {
    vitalRate.innerHTML = `
      <div class="p-4">
        <p class="text-lg font-bold mb-0 text-left">${latestVital.respiratory_rate.value} bpm</p>
        <p class="text-sm text-gray-600 text-left">${latestVital.respiratory_rate.levels}</p>
      </div>
    `;
  }

  // Display temperature
  if (!latestVital.temperature) {
    temperature.innerHTML = 'No temperature data available';
  } else {
    temperature.innerHTML = `
      <div class="p-4">
        <p class="text-lg font-bold text-left">${latestVital.temperature.value}°F</p>
        <p class="text-sm text-gray-600 text-left">${latestVital.temperature.levels}</p>
      </div>
    `;
  }

  // Display heart rate
  if (!latestVital.heart_rate) {
    heartRate.innerHTML = 'No heart rate data available';
  } else {
    heartRate.innerHTML = `
      <div class="p-4">
        <p class="text-lg font-bold text-left">${latestVital.heart_rate.value} bpm</p>
        <p class="text-sm text-gray-600 text-left">${latestVital.heart_rate.levels}</p>
      </div>
    `;
  }
};
