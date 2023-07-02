// AudioTrigger.js

// WebAudio
let WAContext = window.AudioContext || window.webkitAudioContext;
let context;
let device;
let stream;
let init_flag = false;
let param_input_level;
let param_trigger_count;
let param_elapsed_time;

const trigger_start = async () => {
	if (init_flag) {
		return;
    }

	init_flag = true;

	context = new WAContext();
	let rawPatcher = await fetch("rnbo/audiotrigger.json");
	let patcher = await rawPatcher.json();
	device = await RNBO.createDevice({ context, patcher });
	navigator.mediaDevices
		.getUserMedia({ audio: true, video: false })
		.then((_stream) => {
			stream = _stream;
			const UserMediaSource = context.createMediaStreamSource(stream);
			UserMediaSource.connect(device.node);
		});
	device.parametersById.get("threshold_dB").value = -24;
	device.parametersById.get("report_interval").value = 100;
	device.messageEvent.subscribe((ev) => {
		switch (ev.tag) {
			case "out2":
				// trigger
				bang();
				break;
			case "out3":
				// input level
				param_input_level = ev.payload;
				input_level(param_input_level);
				break;
			case "out4":
				// trigger count
				param_trigger_count = ev.payload;
				break;
			case "out5":
				// elapsed　time
				param_elapsed_time = ev.payload;
				break;
			default:
				break;
		}
	});

	// Debug Interface
	const d = `
        <div id="audiotriggerdebug" class="">
        <meter id="meter1" min="-90" max="6" value="-90" style="width:100%;height:50px;"></meter>
        <input id="slider1" type="range" min="-90" max="6" value="-24" onchange="slider_update(this.value)" style="width:100%;height:50px;">
        </div>
        `;
	document.body.insertAdjacentHTML("afterbegin", d);
	document.addEventListener("keydown", (e) => {
		document.getElementById("audiotriggerdebug").classList.toggle("hide");
	});
	// Start
	device.parametersById.get("report").value = 1;
};

const input_level = (value) => {
	document.getElementById("meter1").value = value;
};

const bang = () => {
	const event = new CustomEvent("audioIn", {
		detail: {
			input_level: param_input_level,
			trigger_count: param_trigger_count,
			elapsed_time: param_elapsed_time,
		},
	});
	document.dispatchEvent(event);
};

const slider_update = (value) => {
	device.parametersById.get("threshold_dB").value = value;
};
