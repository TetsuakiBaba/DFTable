

window.addEventListener('load', function () {

});

let fileInput = document.getElementById('file');
let fileReader = new FileReader();
fileInput.onchange = () => {
    let file = fileInput.files[0];
    fileReader.readAsText(file);
};

var waves;
fileReader.onload = () => {
    //console.log(fileReader.result);
    waves = fileReader.result.split(/\n/);
    let x = Array(waves.length);
    for (let i = 0; i < waves.length; i++) {
        x[i] = i;
    }

    var rawdata = {
        x: x,
        y: waves,
        type: 'scatter'
    };
    var data = [rawdata];
    Plotly.newPlot('myDiv', data);

    document.querySelector('#sampling_rate').disabled = false;
    document.querySelector('#sampling_rate').value = 256;
    document.querySelector('#button_dft').disabled = false;

}

function processDFT() {
    document.querySelector('#button_dft').disabled = true;

    let powers = dft(waves);
    powers = powers.slice(0, powers.length / 2);

    const sampling_rate = parseInt(document.querySelector('#sampling_rate').value);
    const buffer_size = waves.length;
    let freq_step = sampling_rate / buffer_size;

    let x = Array(powers.length);
    for (let i = 0; i < powers.length; i++) {
        x[i] = i * freq_step;
    }

    var rawdata = {
        x: x,
        y: powers,
        type: 'scatter'
    };
    var data = [rawdata];
    var layout = {
        title: 'DFT Result',
        xaxis: {
            title: 'Hz'
        },
        yaxis: {
            title: 'Power Spectrum'
        }
    };
    Plotly.newPlot('result_dft', data, layout);


    document.querySelector('#button_dft').disabled = false;
}

// Reference
// http://docolog.cocolog-nifty.com/papalog/2014/03/post-3de1.html
// 一部変更を加えています
function dft(a) {
    var Re = [];// [出力] 実数部
    var Im = [];// [出力] 虚数部
    var powers = [];

    // dft
    var N = a.length;
    for (var j = 0; j < N; ++j) {
        var Re_sum = 0.0;
        var Im_sum = 0.0;
        for (var i = 0; i < N; ++i) {
            var tht = 2 * Math.PI / N * j * i;
            Re_sum += a[i] * Math.cos(tht);
            Im_sum += a[i] * Math.sin(tht);
        }
        Re.push(Re_sum);
        Im.push(Im_sum);
        powers.push(Math.sqrt(Math.pow(Re_sum, 2) + Math.pow(Im_sum, 2)));
    }
    return powers;
}