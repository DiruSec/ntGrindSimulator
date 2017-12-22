document.addEventListener('DOMContentLoaded', function() {
    simulator.initialization();
}, false);
// 主要处理函数
var simulator = {
    initialization: function(){
        this.createEditModel();
        this.createPanel();
        this.addMaterialProperty();
        this.createMaterialQueue();
        this.createMaterialList();
        this.handleBaseUpdate("baseWeapon")
    },

    createEditModel: function() {
        var editModal = new Vue({
            el: "#editModal",
            data: simulator.data.editorData
        });
        $("body").on("click", "#btn-edit-base", this.clickEditButton);
        $("body").on("click", "#btn-edit-save", this.clickSaveButton);
        $("body").on("click", "#btn-edit-material", this.clickMaterialButton);
        $("body").on("click", "#btn-edit-material-list", this.clickMaterialListButton);
        $("body").on("click", "#btn-add-material", this.clickAddMaterialButton);
        $("body").on("click", "#btn-add-material-list", this.clickAddMaterialListButton);
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

    createMaterialQueue: function(){
        var queue = new Vue({
            el: '.area-queue',
            data: function(){
                return {groups: simulator.data.materialQueue,
                        queue: simulator.data.queueInfo,
                        options: {animation: 150, group:'material'},
                        draglist: simulator.data.dragData}
                },
            methods: {
                del: function (index,grp) {
                    this.groups[grp].splice(index, 1);
                    if (this.groups[grp].length === 0){
                        this.groups.splice(grp, 1)
                    }
                    simulator.handleBaseUpdate("baseWeapon")
                },
                delgrp: function(grp){
                    this.groups.splice(grp, 1);
                    simulator.handleBaseUpdate("baseWeapon")
                },
                checkLength: function(evt){
                    if(evt.to !== evt.from && evt.relatedContext.list.length >= 5){
                        return false;
                    }
                },
                handleUpdate: function(){
                    simulator.handleBaseUpdate("baseWeapon")
                }
            }
        })
    },

    createMaterialList: function(){
        var list = new Vue({
            el: '.container-list',
            data: function(){
                return {items: simulator.data.materialList,
                        options: {animation: 150, group:{name: 'material', pull:'clone', put:false}}}
            },
            methods: {
                del: function (index) {
                    this.items.splice(index, 1);
                },
                dragStart: function(){
                    $("#add-material-space").show()
                },
                dragFinish: function(){
                    simulator.handleBaseUpdate("baseWeapon");
                    simulator.handleAddDragItem();
                    $("#add-material-space").hide()
                },
                checkLength: function(evt){
                    if(evt.to.parentElement.id !== "add-material-space" && evt.to !== evt.from && evt.relatedContext.list.length >= 5){
                        return false;
                    }
                }
            }
        })
    },

    clickEditButton: function () {
        for (index in simulator.data.baseWeapon) {
            simulator.data.editorData[index] = simulator.data.baseWeapon[index]
        }
        simulator.handleEditorRarity();
        simulator.updateEditType(simulator.data.baseWeapon, "baseWeapon")
    },

    clickSaveButton: function () {
        var self =  simulator.data;
        var queueList = ["name", "desc", "rarity", "grind", "baseExp"];
        var queueOption = ["materialQueue", "materialList", "addMaterialToQueue", "addMaterialToList"];
        self.editorData["baseExp"] = parseInt(self.editorData["baseExp"]);      // 不知道为什么变成 String，很神奇
        for (index in self.editorData) {
            if (self.editorSource.editType === "baseWeapon"){
                self.editorSource.sourceObject[index] = self.editorData[index];
            }
            if (queueOption.indexOf(self.editorSource.editType)!== -1) {
                if (queueList.indexOf(index)!== -1){
                    self.editorSource.sourceObject[index] = self.editorData[index];
                }
            }
        }
        if (self.editorSource.editType === "addMaterialToQueue"){
            simulator.handleAddMaterial()
        } else if (self.editorSource.editType === "addMaterialToList"){
            simulator.handleAddMaterialList(self.addData)
        }
        simulator.handleBaseUpdate("baseWeapon");
        simulator.updateEditType({}, "")
    },

    clickMaterialButton: function(){
        var self = simulator.data;
        var dataGroup = $(this).attr("data-group");
        var dataIndex = $(this).attr("data-index");
        for (index in self.materialQueue[dataGroup][dataIndex]){
            self.editorData[index] = self.materialQueue[dataGroup][dataIndex][index]
        }
        simulator.handleEditorRarity();
        simulator.updateEditType(self.materialQueue[dataGroup][dataIndex], "materialQueue")
    },

    clickMaterialListButton: function(){
        var dataIndex = $(this).attr("data-index");
        for (index in simulator.data.materialList[dataIndex]){
            simulator.data.editorData[index] = simulator.data.materialList[dataIndex][index]
        }
        simulator.handleEditorRarity();
        simulator.updateEditType(simulator.data.materialList[dataIndex], "materialList")
    },

    clickAddMaterialButton: function(){
        for (index in simulator.data.addData){
            simulator.data.editorData[index] = simulator.data.addData[index]
        }
        simulator.handleEditorRarity();
        simulator.updateEditType(simulator.data.addData, "addMaterialToQueue")
    },

    clickAddMaterialListButton: function(){
        for (index in simulator.data.addData){
            simulator.data.editorData[index] = simulator.data.addData[index]
        }
        simulator.handleEditorRarity();
        simulator.updateEditType(simulator.data.addData, "addMaterialToList")
    },

    addMaterialProperty: function(){
        var self = simulator.data
        for (group in self.materialQueue){
            for (index in self.materialQueue[group]){
                self.materialQueue[group][index]["rule"]  = function(){ return simulator.data.weaponRarity.getData(this.rarity)};
                self.materialQueue[group][index]["expTable"] = function(){ return simulator.data.expTable.getData(this.rarity)};
            }
        }
        for (index in self.materialList){
            self.materialList[index]["rule"]  = function(){ return simulator.data.weaponRarity.getData(this.rarity)};
            self.materialList[index]["expTable"] = function(){ return simulator.data.expTable.getData(this.rarity)};
        }
    },

    updateEditType: function(editObject, editType){
        simulator.data.editorSource.sourceObject = editObject;
        simulator.data.editorSource.editType = editType
    },

    handleAddMaterial: function(){
        var self = simulator.data;
        var queueLength = self.materialQueue.length;
        if (queueLength === 0){
            self.materialQueue.push([self.addData])
        } else{
            var groupLength = self.materialQueue[queueLength-1].length;
            if (groupLength >= 5){
                self.materialQueue.push([self.addData])
            }else{
                self.materialQueue[queueLength-1].push(self.addData)
            }
        }
        self.addData = new BlankData()
    },

    handleAddMaterialList: function(object){
        var self = simulator.data;
        self.materialList.push(object);
        self.addData = new BlankData()
    },

    handleEditorRarity: function(){
        simulator.handleBaseChange()
        $("#modal-input-rarity label").removeClass("active");
        $("#modal-input-rarity input:radio[value=" + simulator.data.editorData["rarity"] + "]").attr("checked", true);
        $("#modal-input-rarity input:radio[value=" + simulator.data.editorData["rarity"] + "]").parent().addClass("active")
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
        } else if (data.nextLv > (data.expTable()[data.grind+1] - data.expTable()[data.grind])){
            data.baseExp = data.expTable()[data.grind] - 1;
        } else{
            data.baseExp = data.expTable()[data.grind+1] - data.nextLv;
        }
        simulator.handleBaseChange()
    },

    handleRarityChange: function(){
        var data = simulator.data.editorData;
        data.rarity = $("#modal-input-rarity input:radio:checked").val();
        simulator.handleBaseChange()
    },

    handleBaseChange: function() {
        var data = simulator.data.editorData;
        if (data.baseExp < 0) {
            data.baseExp = 0;
            data.grind = 0;
            data.nextLv = data.expTable()[1];
            return false;
        } else if (data.baseExp >= data.expTable()[35]) {
            data.baseExp = data.expTable()[35];
            data.grind = 35;
            data.nextLv = 0;
            return false;
        }

        for (index in data.expTable()) {
            index = parseInt(index);
            if (data.baseExp > data.expTable()[index]) {
                data.grind = index;
                data.nextLv = data.expTable()[index + 1] - data.baseExp
            } else if (data.baseExp == data.expTable()[index]) {
                data.grind = index == 35 ? 35 : index;
                data.nextLv = data.expTable()[index + 1] - data.baseExp
            }
        }
    },

    handleBaseUpdate: function(object){
        var self = simulator.data[object];
        var totalExp = self.totalExp();
        for (index in self.expTable()){
            index = parseInt(index)
            if (totalExp > self.expTable()[index]) {
                self.grind = index;
                self.nextLv = self.expTable()[index + 1] - totalExp
            } else if (totalExp == self.expTable()[index]) {
                self.grind = index == 35 ? 35 : index;
                self.nextLv = self.expTable()[index + 1] - totalExp
            }
        }
    },

    handleAddDragItem: function() {
        var self = simulator.data;
        if (self.dragData.length > 0){
            console.log(self.dragData);
            self.dragData.pop()
        }
    }
};

BlankData = function(){
    this.name = "(´・ω・｀)";
    this.desc = "";
    this.rarity = "r123";
    this.totalExp = 0;
    this.grind = 0;
    this.baseExp = 0;
    this.nextLv = 5;
    this.rule = function(){ return simulator.data.weaponRarity.getData(this.rarity)};
    this.expTable =  function(){ return simulator.data.expTable.getData(this.rarity)};
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
    editorSource: {
        "sourceObject": {},
        "editType": ""
    },
    addData: new BlankData(),
    dragData: [],

    baseWeapon: {
        name: "(´・ω・｀)",
        desc: "らんらん♪",
        rarity: "r14",
        grind: 0,
        baseExp: 0,
        nextLv: 176,
        materialExp: function(){ var self = simulator.data; return self.getMaterialExp()},
        totalExp: function(){ return (parseInt(this.baseExp) + parseInt(this.materialExp()))},
        rule: function(){ return simulator.data.weaponRarity.getData(this.rarity)},
        expTable: function(){ return simulator.data.expTable.getData(this.rarity)}
    },

    getMaterialExp: function(){
        var calResult = 0;
        for(group in this.materialQueue) {
            for (index in this.materialQueue[group]) {
                calResult += this.materialQueue[group][index]["baseExp"]
            }
        }
        return calResult
    },

    queueInfo: {
        queueExp: function(){ var self = simulator.data; return self.getMaterialExp()},
        queueCount: function(){ var self = simulator.data; return function(){
            var count = 0;
            for (groups in self.materialQueue){
                count += self.materialQueue[groups].length
            }
            return count}()},
        queueGrind: function(){ var self = simulator.data; return self.materialQueue.length}
    },

    materialQueue: [
        [
            {
                name: "Eternal Psycho Drive",
                desc: "just a test.",
                rarity: "r10",
                grind: 0,
                baseExp: 10
            },
            {
                name: "Akatsuki",
                desc: "just a test.",
                rarity: "r11",
                grind: 0,
                baseExp: 20
            },
            {
                name: "Kazami no tachi",
                desc: "just a test.",
                rarity: "r12",
                grind: 0,
                baseExp: 30
            },
            {
                name: "ボクラガソン",
                desc: "just a test.",
                rarity: "r13",
                grind: 0,
                baseExp: 40
            },
            {
                name: "アモシカシテ",
                desc: "just a test.",
                rarity: "r14",
                grind: 0,
                baseExp: 50
            }
        ],
        [
            {
                name: "Akatsuki",
                desc: "just a test.",
                rarity: "r14",
                grind: 0,
                baseExp: 20
            },
            {
                name: "Kazami no tachi",
                desc: "just a test.",
                rarity: "r14",
                grind: 0,
                baseExp: 30
            },
            {
                name: "Kazami no tachi",
                desc: "just a test.",
                rarity: "r14",
                grind: 0,
                baseExp: 30
            },
            {
                name: "Kazami no tachi",
                desc: "just a test.",
                rarity: "r14",
                grind: 0,
                baseExp: 30
            },
            // {
            //     name: "Kazami no tachi",
            //     desc: "just a test.",
            //     rarity: "r14",
            //     grind: 0,
            //     baseExp: 30
            // }
        ]
    ],

    materialList:[
    {
        name: "Eternal Psycho Drive",
        desc: "just a test.",
        rarity: "r14",
        grind: 0,
        baseExp: 10
    },
    {
        name: "Akatsuki",
        desc: "just a test.",
        rarity: "r14",
        grind: 0,
        baseExp: 20
    },
    {
        name: "Kazami no tachi",
        desc: "just a test.",
        rarity: "r14",
        grind: 0,
        baseExp: 30
    }
]
};