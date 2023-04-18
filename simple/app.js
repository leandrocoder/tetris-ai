const isNeutralinoApp = window.hasOwnProperty('Neutralino');

if (isNeutralinoApp) {   
    Neutralino.init();
    Neutralino.events.on("windowClose", () => Neutralino.app.exit());
}

window.createDirectory = async (path) => {
    if (!isNeutralinoApp || !path) return;
    await Neutralino.filesystem.createDirectory(path);
}

window.saveFile = async (name, data) => {
    if (!isNeutralinoApp || !name || !data) return;
    await window.createDirectory(NL_PATH + '/results');
    const fileData = typeof data === 'string' ? data : JSON.stringify(data, null, 4);
    await Neutralino.filesystem.writeFile(NL_PATH + `/results/${name}`, fileData);
}

window.saveBinaryFile = async (name, data) => {
    if (!isNeutralinoApp || !name || !data) return;
    await window.createDirectory(NL_PATH + '/results');
    await Neutralino.filesystem.writeBinaryFile(NL_PATH + `/results/${name}`, data);
}
