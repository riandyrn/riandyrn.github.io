var myApp = angular.module("myApp", []);
var en = {
    "appTitle": "ThoughtList Awesome!",
    "appSubTitle": "Created with AngularJS",
    "inputAddThoughtPlaceholder": "Put your thought here...",
    "inputEditThoughtPlaceholder": "Enter your thought here...",
    "addButtonCaption": "Add!",
    "listTitle": "Your thought so far:",
    "cancelButtonCaption": "Cancel",
    "saveButtonCaption": "Save",
    "editButtonCaption": "Edit",
    "deleteButtonCaption": "Delete",
    "editModalTitle": "Edit Thought",
    "chooseActionModalTitle": "Choose Action",
    "chooseActionModalCaption": "Choose your action from option below"
};

var ar = {
    "appTitle": "يعتقد قائمة رهيبة!",
    "appSubTitle": "تم إنشاؤها باستخدام AngularJS",
    "inputAddThoughtPlaceholder": "طرح الفكر الخاص بك هنا ...",
    "inputEditThoughtPlaceholder": "أدخل الفكر الخاص بك هنا ...",
    "addButtonCaption": "إضافة!",
    "listTitle": "الفكر الخاص بك حتى الآن:",
    "cancelButtonCaption": "إلغاء",
    "saveButtonCaption": "حفظ",
    "editButtonCaption": "تحرير",
    "deleteButtonCaption": "حذف",
    "editModalTitle": "تحرير الفكر",
    "chooseActionModalTitle": "اختيار العمل",
    "chooseActionModalCaption": "اختيار الإجراء من الخيارات التالية"
}

myApp.controller("mainController", ["$scope", "$log", function($scope, $log){
    
    $scope.currentLanguange = "en";
    $scope.captions = en;
    
    $scope.thoughts = ["I\'m cool!", "I\'m awesome!", "Pure awesomeness never die"];
    $scope.thought = "";
    $scope.currentThought = "";
    
    var currentItemIdx = -1;
    
    $scope.addThought = function() {
        if($scope.thought.length > 0)
        $scope.thoughts.push($scope.thought);
        $scope.thought = "";
    };
    
    $scope.handleKeyDown = function(event) {
        if(event.keyCode === 13) {
            $scope.addThought();
        }
    };
    
    $scope.openModalChooseActionForItem = function(index) {
        currentItemIdx = index;
        $('#modal_confirm').modal('show');
    }
    
    $scope.openModalEditCurrentItem = function() {
        $scope.currentThought = $scope.thoughts[currentItemIdx];
        $('#modal_edit').modal('show');
        $('#modal_confirm').modal('hide');
    }
    
    $scope.deleteCurrentItem = function() {
        $scope.thoughts.splice(currentItemIdx, 1);
        $('#modal_confirm').modal('hide');
        currentItemIdx = -1;
    }
    
    $scope.saveCurrentItem = function() {
        $scope.thoughts.splice(currentItemIdx, 1, $scope.currentThought);
        $('#modal_edit').modal('hide');
        $scope.currentThought = "";
        currentItemIdx = -1;
    }
    
    $scope.handleEditKeyDown = function(event) {
        if(event.keyCode === 13) {
            $scope.saveCurrentItem();
        }
    }
    
    $scope.changeLanguage = function(lang) {
        $scope.currentLanguange = lang;
        if(lang == "en") {
            $scope.captions = en;
        } else if(lang == "ar") {
            $scope.captions = ar;
        }
        
        $('.navbar-collapse').collapse('hide');
    }
    
    $scope.isEnglish = function() {
        var ret = ($scope.currentLanguange == "en");
        console.log("isEnglish(): " + ret);
        return ret;
    }
    
    $scope.isArabic = function() {
        var ret = ($scope.currentLanguange == "ar");
        console.log("isArabic(): " + ret);
        return ret;
    }
}]);