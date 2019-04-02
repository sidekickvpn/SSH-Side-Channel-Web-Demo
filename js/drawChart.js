'use strict';

function drawMyChart(wndw) {
  var ctx = document.getElementById('myChart').getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'TCP Payload Size',
          data: wndw,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderColor: 'rgba(255, 0, 0, 1)',
          borderWidth: 1,
          showLine: true
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            },
            labelString: 'Payload Size (bytes)'
          }
        ]
      },
      xAxes: [
        {
          display: true,
          labelString: 'Time (ms)'
        }
      ],
      responsive: true,
      maintainAspectRatio: false,
      events: []
    }
  });
}

var traffic_window = [];
function update_chart(payload_sz) {
  var dt = new Date();
  var t = dt.getTime();
  traffic_window.push({
    x: t,
    y: payload_sz
  });
  traffic_window = traffic_window.slice(-10);
  drawMyChart(traffic_window);
}

var user_instructions = [
  'Please wait for the message `Could not load host key: /etc/ssh/ssh host ed25519 key` to appear in the System Monitor. Then click next to continue',
  'In the System Monitor, execute the command `adduser test`. Choose a password such as Test55. Then click next to continue',
  'In the System Monitor, execute the command `ifconfig eth0 192.168.1.1`. Then click next to continue',
  'In the System Monitor, execute the command `ssh test@192.168.1.2`. Then click next to continue',
  'Wait for the message `Are you sure to want to continue connecting (yes/no)` to appear in the System Serial Console. Type yes into the System Serial Console, press Enter, then click next to continue',
  'Enter the password (eg. Test55) into the serial console at the password prompt (no characters will be displayed) and press enter. Then click next to continue.',
  'You will get a remote console prompt `(none):$` in the System Monitor. Interact with it. Examine the graph and the Network Log. Notice any patterns? How about records with LENGTH: 36?'
];
var user_instruction_index = 0;

function prevUserInstruction() {
  document.getElementById('instruction_display').innerHTML =
    user_instructions[user_instruction_index];

  document.getElementById('nextBtn').disabled = false;
  if (user_instruction_index != 0) {
    user_instruction_index -= 1;
  } else {
    document.getElementById('prevBtn').disabled = true;
  }
}

function nextUserInstruction() {
  document.getElementById('instruction_display').innerHTML =
    user_instructions[user_instruction_index];

  document.getElementById('prevBtn').disabled = false;
  if (user_instruction_index != user_instructions.length - 1) {
    user_instruction_index += 1;
  } else {
    document.getElementById('nextBtn').disabled = true;
  }
}
