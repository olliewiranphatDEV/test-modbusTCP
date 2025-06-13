document.getElementById('flowRate').textContent = data.flowRate_m3h?.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}) ?? 'null';

document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();



async function getFlowRate() {
    console.log("Flow");

    try {

        const res = await fetch('/flow-rate');
        console.log('res FlowRate', res);

        const data = await res.json();
        console.log('data', data);

        document.getElementById('flowRate').textContent = data.flowRate_m3h ?? 'null';
    } catch (err) {
        document.getElementById('flowRate').textContent = 'Error';
    }
}

async function getNetAccumulator() {
    console.log("Net");

    try {
        const res = await fetch('/net-accumulator');
        console.log('res NetAccumulator', res);
        const data = await res.json();
        console.log('data', data);

        document.getElementById('netAcc').textContent = data.netAccumulator ?? 'null';
    } catch (err) {
        document.getElementById('netAcc').textContent = 'Error';
    }
}

window.onload = function () {
    setInterval(() => {
        getFlowRate();
        getNetAccumulator();
    }, 10000);
};