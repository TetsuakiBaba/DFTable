const fs = require("fs");

fs.readFile("IRSensorTestSmallBaba.csv", "utf-8", (err, data) => {
    if (err) throw err;
    //console.log(data);

    let wave_values = data.split(/\r\n/);
    let waves = [];
    for (wave_value of wave_values) {
        waves.push(parseInt(wave_value));
    }
    //Array(waves.length);
    //console.log(waves);

    //データの間引き回数を指定
    let count_splice = 100; // 100捨てて1つ残す
    let loop = waves.length / count_splice; // 回すべきloop回数
    //console.log('loop:', loop);
    for (let i = 0; i < loop; i++) {
        waves.splice(1 + i, count_splice);
        //console.log(waves);
        //console.log(1 + i, count_splice + i);
    }

    //console.log(waves.length, waves);
    for (wave of waves) {
        console.log(wave);
    }
});