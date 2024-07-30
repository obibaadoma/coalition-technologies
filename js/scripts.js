document.addEventListener("DOMContentLoaded", () => {
  const apiEndpoint = "https://api.coalitiontechnologies.com/patient-data";
  const headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": "https://fedskillstest.coalitiontechnologies.workers.dev"
  });

  fetch(apiEndpoint, { headers })
      .then(response => response.json())
      .then(data => {
          const jessicaTaylor = data.patients.find(patient => patient.name === "Jessica Taylor");
          if (jessicaTaylor) {
              displayPatientData(jessicaTaylor);
          }
      })
      .catch(error => console.error("Error fetching data:", error));
});

function displayPatientData(patient) {
  // Display blood pressure chart
  const ctx = document.getElementById('bloodPressureChart').getContext('2d');
  const chart = new Chart(ctx, {
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
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

  // Populate other patient data here
}
