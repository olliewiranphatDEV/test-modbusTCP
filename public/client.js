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
    getFlowRate();
    getNetAccumulator();
};