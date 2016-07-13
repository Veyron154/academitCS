﻿(function($, ko, _) {
    $(document).ready(function() {
        var vm = new PhoneBookViewModel();
        ko.applyBindings(vm);
        vm.refreshTable();
    });

    function PhoneBookViewModel() {
        var self = this;
        self.tableItems = ko.observableArray([]);
        self.tmpTableItems = ko.observableArray([]);
        self.name = ko.observable("");
        self.surname = ko.observable("");
        self.phone = ko.observable("");
        self.isTopChecked = ko.observable(false);
        self.filterText = ko.observable("");
        self.needValidate = ko.observable(false);
        self.countOfContacts = ko.observable(0);
        self.sizeOfPage = ko.observable(5);
        self.numberOfPage = ko.observable(1);
        self.sortCommand = ko.observable(1);
        self.isSortedByName = ko.observable(false);
        self.isSortedBySurname = ko.observable(true);
        self.isSortedByPhone = ko.observable(false);
        self.isSortedDesc = ko.observable(false);

        self.url = ko.computed(function() {
            return "/PhoneBookService.svc/Excel?filter=" + self.filterText() + "&sortCommand=" + self.sortCommand() +
                "&isSortedDesc=" + self.isSortedDesc();
        });
        self.countOfContactsText = ko.computed(function() {
            return "Число контактов: " + self.countOfContacts();
        });

        self.isTopChecked.subscribe(function(newValue) {
            _.each(self.tableItems(), function(item) {
                item.isChecked(newValue);
            });
        });

        self.refreshTable = function () {
            self.tmpTableItems.removeAll();
            ajaxPostRequest("/PhoneBookService.svc/GetContacts",
            {
                requestData: {
                    filter: self.filterText(),
                    sizeOfPage: self.sizeOfPage(),
                    numberOfPage: self.numberOfPage(),
                    sortCommand: self.sortCommand(),
                    isSortedDesc: self.isSortedDesc()
                }
            }).done(function (data) {
                _.each(data.contactsList, function (contact) {
                    var addedItem = new TableItemViewModel(contact.name, contact.surname, contact.phone, contact.id);
                    self.tmpTableItems.push(addedItem);
                    self.tableItems(self.tmpTableItems());
                });
                self.countOfContacts(data.countOfContacts);
            });
        }

        self.addTableItem = function() {
            self.needValidate(true);

            if (self.surname() === "" || self.name() === "" || self.phone() === "") {
                showAlert("Заполните выделенные поля");
                return;
            }

            ajaxPostRequest("/PhoneBookService.svc/AddContact", {
                contact: {
                    name: self.name(),
                    surname: self.surname(),
                    phone: self.phone()
                }
            }).done(function (baseResponse) {
                if (baseResponse.success === false) {
                    showAlert(baseResponse.message);
                    return;
                }
                self.refreshTable();
            });

            self.name("");
            self.surname("");
            self.phone("");
            self.needValidate(false);
        };

        self.removeTableItem = function(item) {
            var rows = _.filter(self.tableItems(),
                function(item) {
                    return item.isChecked() === true;
                });
            var messageString = "следующие контакты? <br />";
            messageString += _.pluck(rows, "itemSurname").join("<br />");
            if (rows.length === 0) {
                rows.push(item);
                messageString = "контакт: " + item.itemSurname + " ?";
            }
            $.confirm({
                title: "Подтверждение удаления",
                content: "Вы действительно хотите удалить " + messageString,
                confirmButton: "OK",
                cancelButton: "Отмена",
                confirm: function () {
                    var array = _.map(rows, function(r) { return r.itemId });
                    ajaxPostRequest("/PhoneBookService.svc/RemoveContacts ", {
                        ids: array
                    }).done(function() {
                        self.refreshTable();
                    });
                }
            });
        };

        self.executeFilter = function () {
            self.numberOfPage(1);
            self.refreshTable();
        };

        self.cancelFilter = function () {
            self.filterText("");
            self.numberOfPage(1);
            self.refreshTable();
        }

        self.sortByName = function() {
            self.sortCommand(0);
            if (self.isSortedByName()) {
                self.isSortedDesc(!self.isSortedDesc());
            } else {
                self.isSortedDesc(false);
            }
            self.isSortedByName(true);
            self.isSortedBySurname(false);
            self.isSortedByPhone(false);
            self.numberOfPage(1);
            self.refreshTable();
        }

        self.sortBySurname = function () {
            self.sortCommand(1);
            if (self.isSortedBySurname()) {
                self.isSortedDesc(!self.isSortedDesc());
            } else {
                self.isSortedDesc(false);
            }
            self.isSortedBySurname(true);
            self.isSortedByName(false);
            self.isSortedByPhone(false);
            self.numberOfPage(1);
            self.refreshTable();
        }

        self.sortByPhone = function () {
            self.sortCommand(2);
            if (self.isSortedByPhone()) {
                self.isSortedDesc(!self.isSortedDesc());
            } else {
                self.isSortedDesc(false);
            }
            self.isSortedByPhone(true);
            self.isSortedByName(false);
            self.isSortedBySurname(false);
            self.numberOfPage(1);
            self.refreshTable();
        }

        self.getNextPage = function () {
            self.numberOfPage(self.numberOfPage() + 1);
            self.refreshTable();
        }

        self.getPrevPage = function () {
            self.numberOfPage(self.numberOfPage() - 1);
            self.refreshTable();
        }
    }

    function TableItemViewModel(name, surname, phone, id) {
        var self = this;

        self.itemId = id;
        self.itemName = name;
        self.itemSurname = surname;
        self.itemPhone = phone;

        self.isChecked = ko.observable(false);
    }

    function ajaxPostRequest(url, data) {
        return $.ajax({
            url: url,
            data: JSON.stringify(data),
            dataType: "json",
            method: "POST",
            processData: false,
            contentType: "application/json"
        });
    }

    function showAlert(message) {
        $.alert({
            title: "Ошибка заполнения",
            content: message,
            confirmButton: "OK"
        });
    }
})($, ko, _)