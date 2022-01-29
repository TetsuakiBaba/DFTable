window.addEventListener('load', function () {

});

function test() {
    // restyle all traces using attribute strings
    // var update = {
    //     opacity: 0.4,
    //     'marker.color': 'red'
    // };
    // Plotly.restyle('result_dft', update);
}
var g_sampling_rate;
var g_data_size;
var waves_original = [];
var waves;

function dispRawData(value) {
    console.log("test");
    let tmp_waves = waves_original.slice(0, waves_original.length);
    let sampling_rate = value;//document.querySelector('#sampling_rate').value;
    let decrement = parseInt(document.querySelector('#decrement').value);

    tmp_waves = resample(tmp_waves, decrement);

    let x = Array(tmp_waves.length);
    for (let i = 0; i < tmp_waves.length; i++) {
        x[i] = i;
    }

    var rawdata = {
        x: x,
        y: tmp_waves,
        type: 'scatter'
    };
    var data = [rawdata];
    Plotly.newPlot('myDiv', data);

    g_data_size = tmp_waves.length;
    document.querySelector('#new_data_size').innerHTML = tmp_waves.length;
}



function recalcSamplingRate(value) {
    dispRawData(value);
}

let fileInput = document.getElementById('file');
let fileReader = new FileReader();
fileInput.onchange = () => {
    let file = fileInput.files[0];
    fileReader.readAsText(file);
};


fileReader.onload = () => {
    //console.log(fileReader.result);
    waves_original = [];
    waves = fileReader.result.split(/\n/);
    for (let i = 0; i < waves.length; i++) {
        waves_original.push(waves[i]);
    }

    if (waves_original.length > 5000) {
        document.querySelector('#warning').hidden = false;
        document.querySelector('#new_data_size').innerHTML = waves_original.length;
    }
    document.querySelector('#data_size').innerHTML = `Loaded data size: ${waves.length}`;

    document.querySelector('#sampling_rate').disabled = false;
    g_sampling_rate = parseInt(document.querySelector('#sampling_rate').value);
    g_data_size = waves.length;
    dispRawData(g_sampling_rate);
    document.querySelector('#button_dft').disabled = false;

}

function processDFT() {

    document.querySelector('#button_dft').disabled = true;
    document.querySelector('#icon_loading').hidden = false;

    let sampling_rate = document.querySelector('#sampling_rate').value;
    let decrement = document.querySelector('#decrement').value;
    sampling_rate = sampling_rate / decrement;

    let tmp_waves = waves_original.slice(0, waves_original.length);
    tmp_waves = resample(tmp_waves, decrement);

    if (tmp_waves.length > 10000) {
        if (confirm(`Data size is too big (${tmp_waves.length}) !! Are you sure to continue?`)) {

        }
        else {
            document.querySelector('#button_dft').disabled = false;
            document.querySelector('#icon_loading').hidden = true;
            return;
        }

    }
    const buffer_size = tmp_waves.length;
    let freq_step = sampling_rate / buffer_size;

    console.log(decrement, sampling_rate, buffer_size)

    setTimeout(function () {
        let powers = dft(tmp_waves);
        if (powers.length > 0) {

            powers = powers.slice(0, powers.length / 2);
            let psms = powers.map(function (value) {
                return value * freq_step;
            });
            powers = psms;

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
                    title: 'Power Spectrum',
                    //range: [0.0, 5000]
                }
            };
            Plotly.newPlot('result_dft', data, layout);
        }
        else {
            alert('DFT Error:')
        }
        document.querySelector('#icon_loading').hidden = true;
        document.querySelector('#button_dft').disabled = false;
    }, 1000);

}

// Reference
// http://docolog.cocolog-nifty.com/papalog/2014/03/post-3de1.html
// 今回はパワーだけほしかったので、一部変更を加えています
function dft(a) {
    var Re = [];// [出力] 実数部
    var Im = [];// [出力] 虚数部
    var powers = [];
    // dft
    var N = a.length;
    for (let j = 0; j < N; ++j) {
        let Re_sum = 0.0;
        let Im_sum = 0.0;
        for (let i = 0; i < N; ++i) {
            let tht = 2 * Math.PI / N * j * i;
            Re_sum = Re_sum + a[i] * Math.cos(tht);
            Im_sum += a[i] * Math.sin(tht);
        }
        Re.push(Re_sum);
        Im.push(Im_sum);
        powers.push(Math.sqrt(Math.pow(Re_sum, 2) + Math.pow(Im_sum, 2)));

    }
    return powers;
}

function resample(_waves, _n) {
    console.log('_n:', _n);
    if (_n <= 1) {
        return _waves;
    }
    //データの間引き回数を指定
    let count_splice = _n - 1; // _n捨てて1つ残す
    let loop = _waves.length / count_splice; // 回すべきloop回数
    for (let i = 0; i < loop; i++) {
        _waves.splice(1 + i, count_splice);
    }

    console.log(_waves.length);
    return _waves;
}