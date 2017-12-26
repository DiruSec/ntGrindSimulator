/*
    Copyright (C) 2017 DiruSec <diru@dirusec.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/
document.addEventListener('DOMContentLoaded', function() {
    simulator.initialization();
    $("[i18n]").i18n({
        defaultLang: settings.currentLang,
        filePath: "js/jquery/lang/",
        filePrefix: "",
        fileSuffix: "",
        forever: true,
        callback: function() {
        }
    });
}, false);
var settings ={
    currentLang: navigator.language===undefined?'en':navigator.language,
    extraBonus: 0
};
// 主要处理函数
var simulator = {
    initialization: function () {
        this.checkLoadFromServer();
        this.addMaterialProperty();
        this.createEditModal();
        this.createSettingsModal();
        this.createPanel();
        this.createMaterialQueue();
        this.createListenEvent();
        this.createMaterialList();
        this.handleBaseUpdate("baseWeapon");
    },

    checkLoadFromServer: function(){
        if (location.search){
            this.data.loadSeverStorage()
        }
    },

    createEditModal: function () {
        var editModal = new Vue({
            el: "#editModal",
            data: simulator.data.editorData
        });
        $("body").on("click", "#btn-edit-save", this.clickSaveButton);
        $("#editModal").on("hide.bs.modal", this.handleCloseModal);
        $("#settingsModal").on("show.bs.modal", this.handleInitSettings);
        $("#modal-input-total").on("change", this.handleBaseChange);
        $("#modal-input-rarity input[type='radio']").on("change", this.handleRarityChange);
        $("#modal-input-language input[type='radio']").on("change", this.handleLangChange);
        $("#modal-input-grind").on("change", this.handleGrindChange);
        $("#modal-input-next").on("change", this.handleNextChange);
        $("#modal-input-cost").on("change", this.handleCostChange);
        $(".modal-wrapper-material-extra").on("change", this.handleSelectionChange);
    },

    createSettingsModal: function () {
        var settingsModal = new Vue({
            el: "#modal-extraBonus",
            data: settings
        });
        $("#modal-input-extrabonus").on("change", this.handleExtraBonusChange);
    },

    createListenEvent: function () {
        $("body").on("click", "#btn-edit-base", this.clickEditButton);
        $("body").on("click", "#btn-add-to-list", this.handleBaseToList);
        // $("body").on("click", "#btn-edit-material", this.clickMaterialButton);
        $("body").on("click", "#material-tool-add", this.clickAddMaterialListButton);
        $("body").on("click", "#queue-tool-add", this.clickAddMaterialButton);
        $("body").on("click", "#nav-save", this.data.saveLocalStorage);
        $("body").on("click", "#nav-load", this.data.loadLocalStorage);
        $("body").on("click", "#nav-help", this.showHelp);
        $("body").on("click", ".wrapper-mask", simulator.toNextHelp);
        $("body").on("click", "#nav-url", this.data.saveServerStorage)
        // $("body").on("click", "#btn-add-material-list", this.clickMaterialListButton);
        // $("body").on("click", ".container-queue", this.handleQueueSelection);
    },

    addMaterialProperty: function () {
        var self = simulator.data;
        for (group in self.materialQueue) {
            for (index in self.materialQueue[group].data) {
                self.materialQueue[group].data[index]["rule"] = function () {
                    return simulator.data.weaponRarity.getData(this.rarity)
                };
                self.materialQueue[group].data[index]["expTable"] = function () {
                    return simulator.data.expTable.getData(this.rarity)
                };
                self.materialQueue[group].data[index].withEmpr == undefined ? self.materialQueue[group].data[index].withEmpr = false : {};
                self.materialQueue[group].data[index].withPoli == undefined ? self.materialQueue[group].data[index].withPoli = false : {};
                self.materialQueue[group].data[index].sameSet == undefined ? self.materialQueue[group].data[index].sameSet = 0 : {};
                self.materialQueue[group].data[index].cost == undefined ? self.materialQueue[group].data[index].cost = 0 : {};
            }
        }
        for (index in self.materialList) {
            self.materialList[index]["rule"] = function () {
                return simulator.data.weaponRarity.getData(this.rarity)
            };
            self.materialList[index]["expTable"] = function () {
                return simulator.data.expTable.getData(this.rarity)
            };
            self.materialList[index].withEmpr == undefined ? self.materialList[index].withEmpr = false : {};
            self.materialList[index].withPoli == undefined ? self.materialList[index].withPoli = false : {};
            self.materialList[index].sameSet == undefined ? self.materialList[index].sameSet = 0 : {};
            self.materialList[index].cost == undefined ? self.materialList[index].cost = 0 : {};
        }
    },

    createPanel: function () {
        var panel = new Vue({
            el: '#panel-weapon',
            data: function () {
                object = simulator.data.baseWeapon;
                return object
            }
        })
    },

    createMaterialQueue: function () {
        var queue = new Vue({
            el: '.area-queue',
            data: function () {
                return {
                    groups: simulator.data.materialQueue,
                    queue: simulator.data.queueInfo,
                    draglist: simulator.data.dragData,
                    selectedqueue: {data: '', group: null, index: null},
                    material: simulator.data.materialAttention,
                    settings: settings
                }
            },
            methods: {
                del: function () {
                    var grp = this.selectedqueue.group;
                    var index = this.selectedqueue.index;
                    if (grp !== null && index !== null) {
                        this.groups[grp].data.splice(index, 1);
                        if (this.groups[grp].data.length === 0) {
                            this.groups.splice(grp, 1)
                        }
                    } else if (grp !== null && index === null) {
                        this.groups.splice(grp, 1);
                    }
                    this.selectedqueue.data = '';
                    this.selectedqueue.group = null;
                    this.selectedqueue.index = null;
                    simulator.handleBaseUpdate("baseWeapon")
                },
                edit: function () {
                    if (this.selectedqueue.index !== null) {
                        simulator.clickMaterialButton(this.selectedqueue.group, this.selectedqueue.index);
                    }
                },
                dragStart: function () {
                    $("#add-material-space").show();
                },
                dragFinish: function () {
                    simulator.handleBaseUpdate("baseWeapon");
                    simulator.handleMaterialMoved();
                    $("#add-material-space").hide();
                    simulator.handleAddDragItem();
                    this.selectedqueue.data = '';
                    this.selectedqueue.group = null;
                    this.selectedqueue.index = null;
                },
                clone: function (original) {
                    return Object.assign({}, original);
                },
                duplicate: function () {
                    var grp = this.selectedqueue.group;
                    var index = this.selectedqueue.index;
                    if (grp !== null && index !== null) {
                        simulator.handleAddMaterial(Object.assign({}, simulator.data.materialQueue[grp].data[index]))
                    } else if (grp !== null && index === null) {
                        simulator.handleDuplicateGroup(simulator.data.materialQueue[grp])
                    }
                    simulator.handleBaseUpdate("baseWeapon")
                },
                toggleBS: function () {
                    var self = simulator.data;
                    var grp = this.selectedqueue.group;
                    self.materialQueue[grp].gSuccess !== true ?
                        self.materialQueue[grp].gSuccess = true : self.materialQueue[grp].gSuccess = false;
                    simulator.handleBaseUpdate("baseWeapon")
                },
                checkLength: function (evt) {
                    if (evt.to !== evt.from && evt.relatedContext.list.length >= 5) {
                        return false;
                    }
                },
                selected: function (item, grp, index) {
                    if (this.selectedqueue.data != item) {
                        this.selectedqueue.data = item;
                        this.selectedqueue.group = grp;
                        this.selectedqueue.index = index;
                    } else {
                        this.selectedqueue.data = '';
                        this.selectedqueue.group = null;
                        this.selectedqueue.index = null
                    }
                },
                deleteAll: function () {
                    simulator.data.queueClear()
                }
            }
        })
    },

    createMaterialList: function () {
        var list = new Vue({
            el: '.area-material',
            data: function () {
                return {
                    items: simulator.data.materialList,
                    options: {animation: 150, group: {name: 'material', pull: 'clone', put: false}},
                    selectedmaterial: {data: '', index: null}
                }
            },
            methods: {
                del: function () {
                    var index = this.selectedmaterial.index;
                    if (index !== null) {
                        this.items.splice(index, 1);
                    }
                    this.selectedmaterial.data = '';
                    this.selectedmaterial.index = null;
                },
                edit: function () {
                    if (this.selectedmaterial.index !== null) {
                        simulator.clickMaterialListButton(this.selectedmaterial.index);
                    }
                },
                dragStart: function () {
                    $("#add-material-space").show()
                },
                dragFinish: function () {
                    simulator.handleBaseUpdate("baseWeapon");
                    simulator.handleAddDragItem();
                    $("#add-material-space").hide();
                    this.selectedmaterial.data = '';
                    this.selectedmaterial.index = null;
                },
                checkLength: function (evt) {
                    if (evt.to.parentElement.id !== "add-material-space" && evt.to !== evt.from && evt.relatedContext.list.length >= 5) {
                        return false;
                    }
                },
                duplicate: function () {
                    var index = this.selectedmaterial.index;
                    if (index !== null) {
                        simulator.handleAddMaterialList(Object.assign({}, simulator.data.materialList[index]))
                    }
                },
                clone: function (original) {
                    return Object.assign({}, original);
                },
                selected: function (item, index) {
                    if (this.selectedmaterial.data != item) {
                        this.selectedmaterial.data = item;
                        this.selectedmaterial.index = index;
                    } else {
                        this.selectedmaterial.data = '';
                        this.selectedmaterial.index = null
                    }
                },
                deleteAll: function () {
                    simulator.data.listClear()
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
        var self = simulator.data;
        var queueList = ["name", "rarity", "grind", "baseExp", "sameSet", "cost", "withEmpr", "withPoli"];
        var baseExclude = ["sameSet", "withEmpr", "withPoli"];
        var queueOption = ["materialQueue", "materialList", "addMaterialToQueue", "addMaterialToList"];
        self.editorData["baseExp"] = parseInt(self.editorData["baseExp"]);
        for (index in self.editorData) {
            if (self.editorSource.editType === "baseWeapon") {
                if (baseExclude.indexOf(index) === -1) {
                    self.editorSource.sourceObject[index] = self.editorData[index];
                }
            }
            if (queueOption.indexOf(self.editorSource.editType) !== -1) {
                if (queueList.indexOf(index) !== -1) {
                    self.editorSource.sourceObject[index] = self.editorData[index];
                }
            }
        }
        if (self.editorSource.editType === "addMaterialToQueue") {
            simulator.handleAddMaterial(self.addData)
        } else if (self.editorSource.editType === "addMaterialToList") {
            simulator.handleAddMaterialList(self.addData)
        }
        simulator.handleBaseUpdate("baseWeapon");
        simulator.updateEditType({}, "");
        $("#editModal").modal('hide');
    },

    clickMaterialButton: function (grp, ind) {
        var self = simulator.data;
        var dataGroup = grp;
        var dataIndex = ind;
        for (index in self.materialQueue[dataGroup].data[dataIndex]) {
            self.editorData[index] = self.materialQueue[dataGroup].data[dataIndex][index]
        }
        simulator.handleEditorRarity();
        simulator.handleEditorSelection();
        simulator.updateEditType(self.materialQueue[dataGroup].data[dataIndex], "materialQueue");
        $("#editModal").modal('show')
    },

    clickMaterialListButton: function (ind) {
        var dataIndex = ind;
        for (index in simulator.data.materialList[dataIndex]) {
            simulator.data.editorData[index] = simulator.data.materialList[dataIndex][index]
        }
        simulator.handleEditorRarity();
        simulator.handleEditorSelection();
        simulator.updateEditType(simulator.data.materialList[dataIndex], "materialList")
        $("#editModal").modal('show')
    },

    clickAddMaterialButton: function () {
        for (index in simulator.data.addData) {
            simulator.data.editorData[index] = simulator.data.addData[index]
        }
        simulator.handleEditorRarity();
        simulator.handleEditorSelection();
        simulator.updateEditType(simulator.data.addData, "addMaterialToQueue");
    },

    clickAddMaterialListButton: function () {
        for (index in simulator.data.addData) {
            simulator.data.editorData[index] = simulator.data.addData[index]
        }
        simulator.handleEditorRarity();
        simulator.handleEditorSelection();
        simulator.updateEditType(simulator.data.addData, "addMaterialToList")
    },

    updateEditType: function (editObject, editType) {
        simulator.data.editorSource.sourceObject = editObject;
        simulator.data.editorSource.editType = editType;
        $(".modal-wrapper-material-extra").hide();
        if (editType !== "baseWeapon") {
            $(".modal-wrapper-material-extra").show()
        }
    },

    handleAddMaterial: function (object) {
        var self = simulator.data;
        var queueLength = self.materialQueue.length;
        if (queueLength === 0) {
            self.materialQueue.push({data: [object]})
        } else {
            var groupLength = self.materialQueue[queueLength - 1].data.length;
            if (groupLength >= 5) {
                self.materialQueue.push({data: [object]})
            } else {
                self.materialQueue[queueLength - 1].data.push(object)
            }
        }
        self.addData = new BlankData()
    },

    handleAddMaterialList: function (object) {
        var self = simulator.data;
        self.materialList.push(object);
        self.addData = new BlankData()
    },

    handleEditorRarity: function () {
        simulator.handleBaseChange();
        $("#modal-input-rarity label").removeClass("active");
        $("#modal-input-rarity input:radio[value=" + simulator.data.editorData.rarity + "]").prop("checked", true);
        $("#modal-input-rarity input:radio[value=" + simulator.data.editorData.rarity + "]").parent().addClass("active")
    },

    handleEditorSelection: function () {
        $(".modal-wrapper-material-extra label").removeClass("active");
        $("#modal-input-sameset input:radio[value=" + simulator.data.editorData.sameSet + "]").prop("checked", true);
        $("#modal-input-sameset input:radio[value=" + simulator.data.editorData.sameSet + "]").parent().addClass("active");
        simulator.data.editorData.withEmpr ? function () {
                $("#modal-input-withempr").prop("checked", true);
                $("#modal-input-withempr").parent().addClass("active")
            }() :
            $("#modal-input-withempr").prop("checked", false);
        simulator.data.editorData.withPoli ? function () {
                $("#modal-input-withpoli").prop("checked", true);
                $("#modal-input-withpoli").parent().addClass("active")
            }() :
            $("#modal-input-withpoli").prop("checked", false)
    },

    handleSelectionChange: function () {
        simulator.data.editorData.sameSet = parseInt($("#modal-input-sameset input:radio:checked").val());
        simulator.data.editorData.withEmpr = $("#modal-input-withempr").prop("checked");
        simulator.data.editorData.withPoli = $("#modal-input-withpoli").prop("checked")
    },

    handleGrindChange: function () {
        var data = simulator.data.editorData;
        data.grind = isNaN(parseInt(data.grind)) ? 0 : parseInt(data.grind);  // 防止手贱的人输入小数点和非数字
        if (data.grind < 0) {
            data.grind = 0
        } else if (data.grind > 35) {
            data.grind = 35
        }
        data.baseExp = data.expTable()[data.grind];
        simulator.handleBaseChange()
    },

    handleNextChange: function () {
        var data = simulator.data.editorData;
        data.nextLv = isNaN(parseInt(data.nextLv)) ?
            data.expTable()[data.grind + 1] - data.expTable()[data.grind] : parseInt(data.nextLv);  // 防止手贱的人输入小数点和非数字
        if (data.nextLv < 0) {
            data.baseExp = data.expTable()[data.grind + 1];
        } else if (data.nextLv > (data.expTable()[data.grind + 1] - data.expTable()[data.grind])) {
            data.baseExp = data.expTable()[data.grind] - 1;
        } else {
            data.baseExp = data.expTable()[data.grind + 1] - data.nextLv;
        }
        simulator.handleBaseChange()
    },

    handleCostChange: function () {
        var data = simulator.data.editorData;
        data.cost = isNaN(parseInt(data.cost)) ? 0 : parseInt(data.cost);  // 防止手贱的人输入小数点和非数字
        data.cost = data.cost < 0 ? 0 : data.cost;
        simulator.handleBaseChange()
    },

    handleRarityChange: function () {
        var data = simulator.data.editorData;
        data.rarity = $("#modal-input-rarity input:radio:checked").val();
        simulator.handleBaseChange()
    },

    handleExtraBonusChange: function(){
        var data = settings;
        data.extraBonus = isNaN(parseInt(data.extraBonus)) ? 0 : parseInt(data.extraBonus);  // 防止手贱的人输入小数点和非数字
        data.extraBonus = data.extraBonus < 0 ? 0 : data.extraBonus;
    },

    handleBaseChange: function () {
        var data = simulator.data.editorData;
        data.baseExp = isNaN(parseInt(data.baseExp)) ? 0 : parseInt(data.baseExp);
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

    handleBaseUpdate: function (object) {
        var self = simulator.data[object];
        var totalExp = self.totalExp();
        for (index in self.expTable()) {
            index = parseInt(index);
            if (totalExp > self.expTable()[index]) {
                self.grind = index;
                self.nextLv = self.expTable()[index + 1] - totalExp
            } else if (totalExp == self.expTable()[index]) {
                self.grind = index >= 35 ? 35 : index;
                self.nextLv = self.expTable()[index + 1] - totalExp;
                break;
            }
        }
        simulator.data.materialAttention.reset();
    },

    handleDataUpdate: function () {

    },

    handleInitSettings: function () {
        $("#modal-input-language label").removeClass("active");
        $("#modal-input-language input:radio[value=" + settings.currentLang + "]").prop("checked", true);
        $("#modal-input-language input:radio[value=" + settings.currentLang + "]").parent().addClass("active")
    },

    handleLangChange: function () {
        settings.currentLang = $("#modal-input-language input:radio:checked").val();
        $("[i18n]").i18n({
                defaultLang: settings.currentLang,
                filePrefix: "",
                filePath: "js/jquery/lang/"
            }
        )
    },

    handleAddDragItem: function () {
        var self = simulator.data;
        if (self.dragData.length > 0) {
            self.materialQueue.push({data: [self.dragData.pop()]})
        }
        simulator.handleBaseUpdate("baseWeapon")
    },

    handleMaterialMoved: function () {
        var self = simulator.data;
        for (index in self.materialQueue) {
            if (self.materialQueue[index].data.length === 0) {
                self.materialQueue.splice(index, 1)
            }
        }
    },

    handleDuplicateGroup: function (data) {
        var self = simulator.data;
        if (data.data.length > 0) {
            var newObject = {data: []};
            for (index in data.data) {
                newObject.data.push(Object.assign({}, data.data[index]))
            }
            data.gSuccess === true ? newObject.gSuccess = true : newObject.gSuccess = false;
            simulator.data.materialQueue.push(newObject)
        }
    },

    handleBaseToList: function () {
        var self = simulator.data;
        var object = Object.assign({}, self.baseWeapon);
        object.baseExp = self.baseWeapon.totalExp();
        simulator.handleAddMaterialList(object)
    },

    handleCloseModal: function () {
        var self = simulator.data;
        for (index in self.defaultData) {
            self.editorData[index] = self.defaultData[index];
        }
        self.addData = new BlankData();
    },

    helpData: {
        data: [
            [".area-base",'ベース武器です。基本情報もここで表示されます。'],
            [".area-queue",'素材武器の強化リストです。ゲーム本編と同じく5本ごと分かれています。'],
            [".panel-queue",'クリックで選択、ドラッグで順番を変えることができます。'],
            [".queue-tool-set","ツールバーです。"],
            [".queue-tool-set","<span class='oi oi-plus'/> 素材を追加する<br/>" +
            "<span class='oi oi-pencil'/> 選択した素材を編集する<br/>" +
            "<span class='oi oi-trash'/> 選択した素材を削除する<br/>" +
            "<span class='oi oi-trash' style='color:red'/> 素材全削除<br/>" +
            "<span class='oi oi-clipboard'/> 選択した素材を複製する<br/>" +
            "<span class='oi oi-beaker'/> 今回の強化を大成功にする<br/>"],
            [".area-material", '素材リストです。'],
            [".container-list",'強化リストにドラッグすると追加できます。']
        ],
        step: 1
    },

    showHelp: function () {
        $(".wrapper-mask").show();
        simulator.toNextHelp()
    },

    toNextHelp: function(){
        simulator.removeHelp();
        var self = simulator.helpData;
        if (self.step > self.data.length){
            self.step = 1;
            $(".wrapper-mask").hide();
            return false
        }
        var data = self.data[self.step-1];
        simulator.createHelp(data[0],data[1]);
        self.step += 1;
    },

    createHelp: function(object, text){
        $('.wrapper-mask').css('height', $("body").height());
        $('.wrapper-mask').css('width', $("body").width());
        $("<div>", {
            class: 'mask',
            css: {
                width: $(object).outerWidth(true),
                height: $(object).outerHeight(true),
                position: 'absolute',
                top: $(object).position().top,
                left: $(object).position().left,
                'box-shadow': 'rgba(0,0,0,.6) 0 0 0 ' + (window.outerWidth+window.outerHeight) + 'px',
                'z-index': 2,
                'overflow': 'hidden'
            }
        }).appendTo($("body"));
        $("<div>",  {
            class: 'alert alert-light mask',
            css: {
                position: 'absolute',
                top: $(object).position().top + 14 + $(object).outerHeight(true),
                left: $(object).position().left,
                height: 'auto',
                'z-index': 2
            }
        }).html(text).appendTo($("body"))
    },

    removeHelp: function(){
        $('.mask').remove()
    },

    createMessage: function(style,text){
        $('.infobar').remove()
        $("<div>",  {
            class: 'alert infobar alert-' + style,
            css: {
                animation: 'fade-in 0.3s',
                'animation-fill-mode': 'forwards',
                position: 'absolute',
                width: '100%',
                top: 0,
                'z-index': 2
            }
        }).html(text).appendTo($("body"));
        var a=setTimeout("$('.infobar').css('animation','fade-out 0.3s')",2300);
        var b=setTimeout("$('.infobar').remove()",2500)
    },

    createBlinkMessage: function(style,text){
        $('.infobar').remove();
        $("<div>",  {
            class: 'alert infobar alert-' + style,
            css: {
                animation: 'blink 0.5s',
                'animation-direction': 'alternate',
                'animation-iteration-count': 'infinite',
                position: 'absolute',
                width: '100%',
                top: 0,
                'z-index': 2
            }
        }).html(text).appendTo($("body"));
    },

    createLinkMessage: function(style,text){
        $('.infobar').remove();
        $("<div>",  {
            class: 'alert alert-dismissible fade show infobar alert-' + style,
            css: {
                animation: 'fade-in 0.3s',
                'animation-fill-mode': 'forwards',
                position: 'absolute',
                width: '60%',
                left: '20%',
                top: '5%',
                'z-index': 2
            }
        }).html('URL: <a href="'+location.origin+'/?'+text+'">' + location.origin+'/?'+text+ '</a>' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
        '</button>').appendTo($("body"));
    }
};

BlankData = function(){
    this.name = "(´・ω・｀)";
    this.rarity = "r123";
    this.totalExp = 0;
    this.grind = 0;
    this.baseExp = 0;
    this.nextLv = 5;
    this.cost = 0;
    this.rule = function(){ return simulator.data.weaponRarity.getData(this.rarity)};
    this.expTable =  function(){ return simulator.data.expTable.getData(this.rarity)};
    this.sameSet = 0;   // 0 for off, 1 for same category, 2 for same weapon.
    this.withEmpr = false;
    this.withPoli = false;
    this.expAsMaterial = function(){ return simulator.data.getEditorExp()}
};

BaseWeapon = function(){
    this.name= "(´・ω・｀)",
    this.rarity= "r13",
    this.grind= 0,
    this.baseExp= 0,
    this.nextLv= 160,
    this.materialExp= function(){ var self = simulator.data; return self.getMaterialExp()},
    this.totalExp= function(){var exp=this.baseExp + this.materialExp(); return exp>this.expTable()[35]?this.expTable()[35]:exp },
    this.rule= function(){ return simulator.data.weaponRarity.getData(this.rarity)},
    this.expTable= function(){ return simulator.data.expTable.getData(this.rarity)}
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

    getMaterialExp: function(){
        var baseWeaponExp = this.baseWeapon.baseExp;
        var expResult = 0;
        var lvLimit = [11,21,31];
        // Vue 无限循环暂时对策
        var overflowed35 = 0;
        var overflowed35group = 0;
        for (index in this.baseWeapon.expTable()){
            index = parseInt(index);
            if (this.baseWeapon.baseExp < this.baseWeapon.expTable()[index]) { break }
            if (lvLimit.indexOf(index)!= -1 || lvLimit.indexOf(index+1)!= -1) { lvLimit.shift() }
        }
        for(group in this.materialQueue) {
            var sectionResult = 0;
            var sectionOverflowed = 0;
            for (index in this.materialQueue[group].data) {
                var thisObj = this.materialQueue[group].data[index];
                var basicExp = thisObj.rule().basicExp;
                var materialBonus = function() {
                    if(simulator.data.baseWeapon.rarity == thisObj.rarity && thisObj.sameSet == 2) {
                        return thisObj.rule().sameWeapon
                    } else {
                        if (thisObj.sameSet == 2) {
                            simulator.data.materialAttention.configure("sameWeaponNotMatch", true, null, null);
                        }
                        return ((thisObj.sameSet==1?thisObj.rule().sameCategory:0)+(thisObj.rarity===simulator.data.baseWeapon.rarity?thisObj.rule().sameRarity:0))
                    }}();
                var grindBonus = parseInt(thisObj.baseExp/2) + (thisObj.withEmpr?90:0) + (thisObj.withPoli?25:0);
                if (this.materialQueue[group].gSuccess){
                    basicExp = Math.ceil(basicExp*1.5);
                    materialBonus = Math.ceil(materialBonus*1.5);
                    grindBonus = Math.ceil(grindBonus*1.5)
                }
                if (settings.extraBonus>0){
                    var extraBonus = 1+(settings.extraBonus/100);
                    basicExp = Math.ceil(basicExp*extraBonus);
                    materialBonus = Math.ceil(materialBonus*extraBonus);
                    grindBonus = Math.ceil(grindBonus*extraBonus)
                }
                //TODO: 大赦选项和计算
                sectionResult += basicExp + materialBonus + grindBonus
            }
            if (baseWeaponExp + expResult + sectionResult >= this.baseWeapon.expTable()[lvLimit[0]]){
                sectionOverflowed = baseWeaponExp + expResult + sectionResult - this.baseWeapon.expTable()[lvLimit[0]] + 1;
                expResult = this.baseWeapon.expTable()[lvLimit[0]] - baseWeaponExp -1;
                this.materialAttention.configure([lvLimit[0]], true, sectionOverflowed, group);
                lvLimit.shift();
            } else if (baseWeaponExp + expResult + sectionResult >= this.baseWeapon.expTable()[35]){
                // TODO: 修改逻辑更优雅避免 Vue 无限循环
                overflowed35 += baseWeaponExp + expResult + sectionResult - this.baseWeapon.expTable()[35];
                expResult = this.baseWeapon.expTable()[35] - baseWeaponExp;
                overflowed35group = group;
                console.log("here?")
            } else {
                expResult += sectionResult;
            }
        }
        if (overflowed35 > 0){
            this.materialAttention.configure([35], true, overflowed35, overflowed35group);
        }
        return expResult
    },

    getMaterialMeseta: function(){
        var cost = 0;
        for (group in this.materialQueue){
            for (index in this.materialQueue[group].data){
                cost += this.materialQueue[group].data[index].rule().cost.meseta;
                cost += this.materialQueue[group].data[index].cost!==undefined?this.materialQueue[group].data[index].cost:0;
            }
        }
        return cost
    },

    getEditorExp: function(){
        var data = simulator.data.editorData;
        var result = 0;
        result += data.rule().basicExp;
        result += parseInt(data.baseExp/2);
        result += data.withEmpr?90:0;
        result += data.withPoli?25:0;
        if (data.sameSet == 1){
            result += 5 + (simulator.data.baseWeapon.rarity==data.rarity?data.rule().sameRarity:0)
        } else if (data.sameSet == 2){
            data.rarity==simulator.data.baseWeapon.rarity?result+=data.rule().sameWeapon:{}
        } else{
            data.rarity==simulator.data.baseWeapon.rarity?result+=data.rule().sameRarity:{}
        }
        return result;
    },

    queueInfo: {
        queueExp: function(){ var self = simulator.data; return self.getMaterialExp()},
        queueCount: function(){ var self = simulator.data; return function(){
            var count = 0;
            for (groups in self.materialQueue){
                count += self.materialQueue[groups].data.length
            }
            return count}()},
        queueGrind: function(){ var self = simulator.data; return self.materialQueue.length},
        queueCost: function(){ var self = simulator.data; return self.getMaterialMeseta()}
    },

    baseWeapon: {
        name: "(´・ω・｀)",
        rarity: "r13",
        grind: 0,
        baseExp: 0,
        nextLv: 160,
        materialExp: function(){ var self = simulator.data; return self.getMaterialExp()},
        totalExp: function(){var exp=this.baseExp + this.materialExp(); return exp>this.expTable()[35]?this.expTable()[35]:exp },
        rule: function(){ return simulator.data.weaponRarity.getData(this.rarity)},
        expTable: function(){ return simulator.data.expTable.getData(this.rarity)}
    },

    defaultData:{
        name: "(´・ω・｀)",
        rarity : "r123",
        totalExp : 0,
        grind : 0,
        baseExp : 0,
        nextLv : 5,
        cost: 0,
        sameSet : 0,
        withEmpr : false,
        withPoli : false
    },

    queueClear: function(){
        var self = simulator.data;
        while (self.materialQueue.length>0){
            self.materialQueue.pop()
        }
        simulator.handleBaseUpdate('baseWeapon')
    },

    listClear: function(){
        var self = simulator.data;
        while (self.materialList.length>0){
            self.materialList.pop()
        }
    },

    saveLocalStorage: function(){
        var self = simulator.data;
        localStorage.clear();
        simulator.createMessage('primary', 'Saving...');
        try {
            localStorage.setItem('materialQueue', JSON.stringify(self.materialQueue));
            localStorage.setItem('baseWeapon', JSON.stringify(self.baseWeapon));
            localStorage.setItem('materialList', JSON.stringify(self.materialList));
            simulator.createMessage('success', 'Data saved.');
        }
        catch(err){
            simulator.createMessage('danger', 'Error: '+err);
        }
    },

    loadLocalStorage: function(){
        simulator.createMessage('primary', 'Loading...');
        try {
            var self = simulator.data;
            self.loadToQueue(JSON.parse(localStorage.getItem('materialQueue')));
            self.loadToBase(JSON.parse(localStorage.getItem('baseWeapon')));
            self.loadToList(JSON.parse(localStorage.getItem('materialList')));
            simulator.createMessage('success', 'Data loaded.');
        }
        catch(err){
            simulator.createMessage('danger', 'Error: '+err);
        }
    },

    loadToQueue: function(object){
        var self = simulator.data;
        var loadedQueue = object;
        if (loadedQueue !== null) {
            self.queueClear();
            for (group in loadedQueue) {
                var savedata = {gSuccess: loadedQueue[group].gSuccess, data: []};
                for (index in loadedQueue[group].data) {
                    var objectQueue = new BlankData();
                    for (item in loadedQueue[group].data[index]) {
                        objectQueue[item] = loadedQueue[group].data[index][item]
                    }
                    savedata.data.push(objectQueue)
                }
                self.materialQueue.push(savedata)
            }
        }
    },

    loadToBase: function(object){
        var self = simulator.data;
        var loadedBase = object;
        if (loadedBase !== null) {
            var setBase = new BaseWeapon();
            for (index in setBase) {
                self.baseWeapon[index] = loadedBase[index] == undefined ? setBase[index] : loadedBase[index]
            }
        }
    },

    loadToList: function(object){
        var self = simulator.data;
        var loadedList = object;
        if (loadedList !== null) {
            self.listClear();
            for (group in loadedList) {
                var objectList = new BlankData();
                for (index in loadedList[group]) {
                    objectList[index] = loadedList[group][index]
                }
                self.materialList.push(objectList)
            }
        }
    },

    saveServerStorage: function(){
        simulator.createBlinkMessage("primary","Saving...");
        var self = simulator.data;
        $.ajax({
            method: "POST",
            url: "cgi-bin/save.py",
            data: {
                    queue: JSON.stringify(self.materialQueue),
                    list: JSON.stringify(self.materialList),
                    base: JSON.stringify(self.baseWeapon)
                },
        })
            .done(function(data){
            simulator.createLinkMessage("info", data.dataid)
        })
            .fail(function(data){
            console.log("error",data)
        });
    },

    loadSeverStorage: function(){
        simulator.createBlinkMessage("primary","Loading...");
        $.ajax({
            url: "cgi-bin/load.py",
            method: "POST",
            data: {data: location.search.slice(1)}
        })
            .done(function(data){
                try
                {
                    if (data.status == 'success') {
                        var self = simulator.data;
                        self.loadToQueue(JSON.parse(data.data).queue);
                        self.loadToBase(JSON.parse(data.data).base);
                        self.loadToList(JSON.parse(data.data).list);
                        simulator.createMessage('success', data.message)
                    } else if (data.status == 'error') {
                        simulator.createMessage('danger', data.message)
                    }
                }
                catch(err){
                    simulator.createMessage('danger', "Error:" + err)
                }
        })
            .fail(function(data){
                simulator.createMessage('danger',"Data load failed.")
            });
    },

    materialAttention: {
        reset: function(){
            for (index in this.data){
                this.data[index].happened = false;
                this.data[index].exp = 0;
                this.data[index].position = 0;
            }
        },
        configure: function(dataName,happenedData,expData,positionData){
            this.data[dataName].happened = happenedData;
            this.data[dataName].exp = expData;
            this.data[dataName].position = positionData;
        },
        check: function(){
            for (index in this.data){
                if (this.data[index].happened){
                    return true;
                }
            }
            return false;
        },
        checkPos: function(pos){
            for (index in this.data) {
                if (this.data[index].position == pos && this.data[index].happened) {
                    return [true, this.data[index].exp]
                }
            }
            return [false,0]
        },
        data:{
            "11": {
                happened: false,
                exp: 0,
                position: 0
            },
            "21": {
                happened: false,
                exp: 0,
                position: 0
            },
            "31": {
                happened: false,
                exp: 0,
                position: 0
            },
            "35": {
                happened: false,
                exp: 0,
                position: 0
            },
            sameWeaponNotMatch:{
                happened: false,
                position: 0
            }}
    },

    materialQueue: [
        {
            gSuccess: false,
            data: [
                {
                    name: "エターナルサイコドライブ",
                    rarity: "r14",
                    grind: 0,
                    baseExp: 0,
                    sameSet: 0,
                    withEmpr: false,
                    withPoli: false
                },
                {
                    name: "アカツキ",
                    rarity: "r14",
                    grind: 0,
                    baseExp: 0
                },
                {
                    name: "カザミのタチ",
                    rarity: "r14",
                    grind: 0,
                    baseExp: 0
                },
                {
                    name: "ボクラガソン",
                    rarity: "r13",
                    grind: 0,
                    baseExp: 0
                },
                {
                    name: "アモシカシティ",
                    rarity: "r14",
                    grind: 0,
                    baseExp: 0
                }
            ]
        },
        {
            gSuccess: false,
        data :[
            {
                name: "サイコウォンド",
                rarity: "r12",
                grind: 0,
                baseExp: 0
            },
            {
                name: "アーレスタリス",
                rarity: "r13",
                grind: 0,
                baseExp: 0
            },
            {
                name: "ソード",
                rarity: "r123",
                grind: 0,
                baseExp: 0
            },
            {
                name: "ニレンアギド",
                rarity: "r11",
                grind: 0,
                baseExp: 0
            }
        ]
        }
    ],

    materialList:[
    {
        name: "エンペ★９",
        rarity: "r789",
        grind: 5,
        baseExp: 100,
        withEmpr: true
    },
    {
        name: "ディオ+５",
        rarity: "r10",
        grind: 5,
        baseExp: 160
    },
    {
        name: "★13+9",
        rarity: "r13",
        grind: 9,
        baseExp: 1720
    }
]
};