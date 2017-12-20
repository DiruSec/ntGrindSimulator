document.addEventListener('DOMContentLoaded', function() {
    simulator.initialization();
}, false);
// 主要处理函数
var simulator = {
    initialization: function(){
        this.createEditModel();
        this.createPanel();
    },

    createEditModel: function() {
        var editModal = new Vue({
            el: "#editModal",
            data: simulator.data.editorData
        });
        $("body").on("click", "#btn-edit-base", this.clickEditButton);
        $("body").on("click", "#btn-edit-save", this.clickSaveButton);
        $("#modal-input-total").on("change", this.handleBaseChange);
        $("#modal-input-rarity input[type='radio']").on("change", this.handleRarityChange);
        $("#modal-input-grind").on("change", this.handleGrindChange);
        $("#modal-input-next").on("change", this.handleNextChange);
    },

    createPanel: function(){
        var panel = new Vue({
            el: '#panel-weapon',
            data: function() {
                object = simulator.data.baseWeapon;
                return object
            }
        })
    },

    createThumbPic: function(){
        var html = '<div class="img-wrapper">' +
            '<img src="http://temp.im/100x100" />' +
            '<p>  </p>' +
            '</div>';
        return html;
    },

    clickEditButton: function () {
        for (index in simulator.data.baseWeapon) {
            simulator.data.editorData[index] = simulator.data.baseWeapon[index]
        }
        $("#modal-input-rarity label").removeClass("active");
        $("#modal-input-rarity input:radio[value=" + simulator.data.editorData["rarity"] + "]").attr("checked", true)
        $("#modal-input-rarity input:radio[value=" + simulator.data.editorData["rarity"] + "]").parent().addClass("active")
    },

    clickSaveButton: function () {
        for (index in simulator.data.editorData) {
            simulator.data.baseWeapon[index] = simulator.data.editorData[index]
        }
    },

    handleGrindChange: function(){
        var data = simulator.data.editorData;
        if (data.grind < 0){
            data.grind = 0
        } else if (data.grind > 35){
            data.grind = 35
        }
        data.baseExp = data.expTable()[data.grind]
        simulator.handleBaseChange()
    },

    handleNextChange: function(){
        var data = simulator.data.editorData;
        if (data.nextLv < 0){
            data.baseExp = data.expTable()[data.grind+1];
            simulator.handleBaseChange()
        } else if (data.nextLv > (data.expTable()[data.grind+1] - data.expTable()[data.grind])){
            data.baseExp = data.expTable()[data.grind] - 1;
            simulator.handleBaseChange()
        } else{
            data.baseExp = data.expTable()[data.grind+1] - data.nextLv;
            simulator.handleBaseChange()
        }
    },

    handleRarityChange: function(){
        var data = simulator.data.editorData;
        data.rarity = $("#modal-input-rarity input:radio:checked").val()
        simulator.handleBaseChange()
    },

    handleBaseChange: function(){
        var data = simulator.data.editorData;
        if (data.baseExp < 0){
            data.baseExp = 0;
            data.grind = 0;
            data.nextLv = data.expTable()[1];
            return false;
        } else if (data.baseExp >= data.expTable()[35]){
            data.baseExp = data.expTable()[35];
            data.grind = 35;
            data.nextLv = 0;
            return false;
        }

        for (index in data.expTable()){
            index = parseInt(index);
            if (data.baseExp > data.expTable()[index]){
                data.grind = index;
                data.nextLv = data.expTable()[index+1] - data.baseExp
            } else if (data.baseExp == data.expTable()[index]){
                data.grind =  index==35?35:index;
                data.nextLv = data.expTable()[index+1] - data.baseExp
            }
        }
    },

    appendMaterial: function(object){

    }
};

BlankData = function(){
    this.name = "";
    this.desc = "";
    this.rarity = "";
    this.totalExp = "";
    this.grind = "";
    this.baseExp = "";
    this.nextLv = "";
};

simulator.data = {
    expTable: {
        "r123": [0, 5, 10, 15, 20, 22, 24, 29, 34, 42, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 330, 360, 390, 420, 450, 450],
        "r456": [0, 5, 10, 20, 30, 35, 40, 50, 60, 70, 80, 90, 100, 110, 125, 140, 155, 170, 185, 205, 225, 245, 265, 285, 305, 325, 350, 375, 400, 425, 450, 490, 530, 570, 610, 650, 650],
        "r789": [0, 20, 40, 60, 80, 100, 120, 145, 170, 195, 220, 245, 270, 295, 320, 350, 380, 410, 440, 470, 500, 540, 580, 620, 660, 700, 760, 820, 880, 940, 1000, 1070, 1140, 1210, 1280, 1350, 1350],
        "r10": [0, 30, 60, 90, 120, 160, 200, 240, 280, 330, 380, 430, 480, 530, 580, 640, 700, 760, 840, 920, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2120, 2240, 2360, 2480, 2600, 2600],
        "r11": [0, 50, 100, 150, 200, 250, 300, 350, 425, 500, 575, 650, 725, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1620, 1740, 1860, 1980, 2100, 2220, 2340, 2460, 2580, 2700, 2840, 2980, 3120, 3260, 3400, 3400],
        "r12": [0, 80, 160, 240, 320, 400, 500, 600, 700, 800, 900, 1040, 1180, 1320, 1460, 1600, 1780, 1960, 2140, 2320, 2500, 2710, 2920, 3130, 3340, 3550, 3760, 3970, 4180, 4390, 4600, 4840, 5080, 5320, 5560, 5800, 5800],
        "r13": [0, 160, 320, 480, 640, 840, 1040, 1240, 1480, 1720, 1960, 2240, 2520, 2800, 3120, 3440, 3760, 4120, 4480, 4840, 5200, 5560, 5920, 6320, 6720, 7120, 7520, 7940, 8360, 8780, 9200, 9680, 10160, 10640, 11120, 11600, 11600],
        "r14": [0, 176, 352, 528, 704, 924, 1144, 1364, 1628, 1892, 2156, 2464, 2772, 3080, 3432, 3784, 4136, 4532, 4928, 5324, 5720, 6116, 6512, 6952, 7392, 7832, 8272, 8734, 9196, 9658, 10120, 10648, 11176, 11704, 12232, 12760, 12760],
        getData: function(string){
            return this[string]
        }
    },
    weaponRarity: {
        "r123": {name: "★1~3", basicExp: 2, sameCategory: 5, sameRarity: 15, sameWeapon: 25, cost:{meseta: 2000, grinder: 1}, limit: "drop"},
        "r456": {name: "★4~6", basicExp: 5, sameCategory: 5, sameRarity: 15, sameWeapon: 30, cost:{meseta: 4000, grinder: 1}, limit: "drop"},
        "r789": {name: "★7~9", basicExp: 40, sameCategory: 5, sameRarity: 20, sameWeapon: 45, cost:{meseta: 16000, grinder: 1}, limit: "sphere"},
        "r10": {name: "★10", basicExp: 50, sameCategory: 5, sameRarity: 30, sameWeapon: 60, cost:{meseta: 19800, grinder: 1}, limit: "sphere"},
        "r11": {name: "★11", basicExp: 60, sameCategory: 5, sameRarity: 30, sameWeapon: 60, cost:{meseta: 23500, grinder: 1}, limit: "sphere"},
        "r12": {name: "★12", basicExp: 90, sameCategory: 5, sameRarity: 50, sameWeapon: 110, cost:{meseta: 35000, grinder: 1}, limit: "sphere"},
        "r13": {name: "★13", basicExp: 180, sameCategory: 5, sameRarity: 90, sameWeapon: 185, cost:{meseta: 100000, lamgrinder: 1}, limit: "sphere"},
        "r14": {name: "★14", basicExp: 180, sameCategory: 5, sameRarity: 90, sameWeapon: 185, cost:{meseta: 100000, lamgrinder: 1}, limit: "sphere"},
        getData: function(string){
            return this[string]
        }
    },

    editorData: new BlankData(),

    baseWeapon: {
        name: "Eternal Psycho Drive",
        desc: "just a test.",
        rarity: "r14",
        grind: 0,
        baseExp: 0,
        nextLv: 176,
        materialExp: 0,
        totalExp: function(){ return (parseInt(this.baseExp) + parseInt(this.materialExp))},
        rule: function(){ return simulator.data.weaponRarity.getData(this.rarity)},
        expTable: function(){ return simulator.data.expTable.getData(this.rarity)}
    },

    materialList: {
        "EternalPsychoDrive" : {
            name: "Eternal Psycho Drive",
            desc: "just a test.",
            rarity: "r14",
            grind: 0,
            totalExp: 0
        },
        "Kazaminotachi" : {
            name: "Kazami no tachi",
            desc: "just a test.",
            rarity: "r14",
            grind: 0,
            totalExp: 0
        }
    }
};