/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var tsf_web_1 = __webpack_require__(1);
var todo_1 = __webpack_require__(3);
var app = new tsf_web_1.TSF('#app');
app.run(new todo_1.TodoComponent());


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var observer_1 = __webpack_require__(2);
var EVENTS = [];
for (var key in document) {
    if (key.startsWith('on')) {
        EVENTS.push(key);
    }
}
var TSF = /** @class */ (function () {
    function TSF(selector) {
        this.initializedComponents = new Map();
        this.componentClasses = new Map();
        this.watcher = new observer_1.ObservableStructure();
        this.rootElement = document.querySelector(selector);
    }
    TSF.prepareTemplate = function (template) {
        // replace {{ this.something }} to <text $innerHTML="this.something"></text>
        template = template.replace(new RegExp('\{\{([^}]+)\}\}', 'g'), function (match, expr) {
            return "<text $innerHTML=\"" + expr + "\"></text>";
        });
        return template;
    };
    TSF.prototype.register = function (name, componentClass) {
        this.componentClasses.set(name, componentClass);
    };
    TSF.prototype.component = function (name, componentInstance) {
        this.initializedComponents.set(name, componentInstance);
    };
    TSF.prototype.run = function (component) {
        this.process(component, this.rootElement);
    };
    TSF.prototype.process = function (component, domElement, customTemplate, contextVars, contextValues) {
        if (customTemplate === void 0) { customTemplate = ''; }
        if (contextVars === void 0) { contextVars = []; }
        if (contextValues === void 0) { contextValues = []; }
        domElement.innerHTML = TSF.prepareTemplate(customTemplate || component.$template);
        var dynamicBindingsIf = this.prepareDynamicIf(component, domElement);
        var dynamicBindingsFor = this.prepareDynamicFor(component, domElement);
        var textNodesBindings = this.processTextNodes(component, domElement, contextVars, contextValues);
        var attrBindings = this.processAttributes(component, domElement, contextVars, contextValues);
        var bindings = dynamicBindingsIf.concat(dynamicBindingsFor).concat(textNodesBindings).concat(attrBindings);
        this.watcher.observe(component, bindings);
        this.processEvents(component, domElement, contextVars, contextValues);
        this.processComponents(domElement);
        this.processDynamic(component, domElement, dynamicBindingsIf);
        this.processDynamic(component, domElement, dynamicBindingsFor);
    };
    TSF.prototype.processTextNodes = function (component, domElement, contextVars, contextValues) {
        if (contextVars === void 0) { contextVars = []; }
        if (contextValues === void 0) { contextValues = []; }
        var bindings = [];
        var matches = domElement.querySelectorAll('[\\$innerHTML]');
        [].forEach.call(matches, function (match) {
            var expr = match.getAttribute('$innerHTML');
            var textNode = document.createTextNode('');
            var evalFunction = new Function(contextVars.join(','), 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            var binding = {
                expr: expr,
                component: component,
                contextVars: contextVars,
                contextValues: contextValues,
                textNode: textNode,
                evalFunction: evalFunction,
                compile: function () {
                    textNode.data = evalFunction.apply(component, contextValues);
                },
            };
            bindings.push(binding);
            binding.compile();
        });
        return bindings;
    };
    TSF.prototype.processEvents = function (component, domElement, contextVars, contextValues) {
        if (contextVars === void 0) { contextVars = []; }
        if (contextValues === void 0) { contextValues = []; }
        var _loop_1 = function (event_1) {
            var matches = domElement.querySelectorAll('[\\$' + event_1 + ']');
            [].forEach.call(matches, function (match) {
                var listener = new Function(contextVars.concat('$event').join(','), match.getAttribute('$' + event_1));
                match.removeAttribute('$' + event_1);
                match.addEventListener(event_1.substring(2), function ($event) {
                    window.requestAnimationFrame(function () { return listener.apply(component, contextValues.concat($event)); });
                });
            });
        };
        for (var _i = 0, EVENTS_1 = EVENTS; _i < EVENTS_1.length; _i++) {
            var event_1 = EVENTS_1[_i];
            _loop_1(event_1);
        }
    };
    TSF.prototype.processAttributes = function (component, domElement, contextVars, contextValues) {
        if (contextVars === void 0) { contextVars = []; }
        if (contextValues === void 0) { contextValues = []; }
        var bindings = [];
        var matches = domElement.parentNode.querySelectorAll('[\\$attr]');
        [].forEach.call(matches, function (match) {
            var expr = match.getAttribute('$attr');
            var textNode = document.createTextNode('');
            var evalFunction = new Function(contextVars.join(','), 'return ' + expr);
            var binding = {
                expr: expr,
                component: component,
                contextVars: [],
                contextValues: [],
                textNode: textNode,
                evalFunction: evalFunction,
                compile: function () {
                    var attributes = evalFunction.apply(component, contextValues);
                    Object.keys(attributes).forEach(function (attr) {
                        if (attributes[attr] === null) {
                            match.removeAttribute(attr);
                        }
                        else {
                            match.setAttribute(attr, attributes[attr]);
                        }
                    });
                },
            };
            bindings.push(binding);
            binding.compile();
            match.removeAttribute('$attr');
        });
        return bindings;
    };
    TSF.prototype.prepareDynamicIf = function (component, domElement) {
        var _this = this;
        var bindings = [];
        var match = domElement.querySelector('[\\$if]');
        var _loop_2 = function () {
            var expr = match.getAttribute('$if');
            match.removeAttribute('$if');
            var html = match.outerHTML;
            var textNode = document.createTextNode('');
            var evalFunction = new Function('', 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            var genereatedElement;
            var binding = {
                expr: expr,
                component: component,
                contextVars: [],
                contextValues: [],
                textNode: textNode,
                evalFunction: evalFunction,
                compile: function () {
                    if (genereatedElement) {
                        genereatedElement.remove();
                        genereatedElement = null;
                    }
                    if (evalFunction.apply(component)) {
                        genereatedElement = _this.newElement(html);
                        textNode.parentNode.insertBefore(genereatedElement, textNode);
                        _this.process(component, genereatedElement, genereatedElement.innerHTML);
                    }
                    else {
                        if (genereatedElement) {
                            genereatedElement.remove();
                            genereatedElement = null;
                        }
                    }
                },
            };
            bindings.push(binding);
            match = domElement.querySelector('[\\$if]');
        };
        while (match && match.getAttribute) {
            _loop_2();
        }
        return bindings;
    };
    TSF.prototype.prepareDynamicFor = function (component, domElement) {
        var _this = this;
        var bindings = [];
        var match = domElement.querySelector('[\\$for]');
        var _loop_3 = function () {
            var expr = match.getAttribute('$for');
            match.removeAttribute('$for');
            var html = match.outerHTML;
            var textNode = document.createTextNode('');
            var evalFunction = new Function('', 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            var currentItems = [];
            var binding = {
                expr: expr,
                component: component,
                contextVars: [],
                contextValues: [],
                textNode: textNode,
                evalFunction: evalFunction,
                compile: function (params) {
                    if (params && params.type === 'update') {
                        // do not re-render list, dom should be updated automatically
                    }
                    else if (params && params.type === 'push') {
                        var items = evalFunction.apply(component);
                        for (var index = currentItems.length; index < items.length; index++) {
                            var newElement = _this.newElement(html);
                            textNode.parentNode.insertBefore(newElement, textNode);
                            currentItems.push({ element: newElement });
                            _this.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                        }
                    }
                    else {
                        if (currentItems.length) {
                            currentItems.forEach(function (item, index) {
                                item.element.remove();
                            });
                            currentItems.length = 0;
                        }
                        var items = evalFunction.apply(component);
                        items.forEach(function (item, index) {
                            var newElement = _this.newElement(html);
                            textNode.parentNode.insertBefore(newElement, textNode);
                            currentItems.push({ element: newElement });
                            _this.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                        });
                    }
                },
            };
            bindings.push(binding);
            match = domElement.querySelector('[\\$for]');
        };
        while (match && match.getAttribute) {
            _loop_3();
        }
        return bindings;
    };
    TSF.prototype.processDynamic = function (component, domElement, bindings) {
        bindings.forEach(function (binding) { return binding.compile(); });
    };
    TSF.prototype.processComponents = function (domElement) {
        var _this = this;
        this.initializedComponents.forEach(function (componentInstance, name) {
            var element = domElement.querySelector(name);
            if (element) {
                _this.process(componentInstance, element);
            }
        });
        this.componentClasses.forEach(function (componentClass, name) {
            var matches = domElement.querySelectorAll(name);
            [].forEach.call(matches, function (element) {
                _this.process(new componentClass(), element);
            });
        });
    };
    TSF.prototype.newElement = function (html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild;
    };
    return TSF;
}());
exports.TSF = TSF;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var observerId = 0;
var ObservableStructure = /** @class */ (function () {
    function ObservableStructure() {
        this.allWatchedObjects = new Map();
        this.bindingsByAttr = {};
    }
    ObservableStructure.isObject = function (obj) {
        return Object.prototype.toString.apply(obj) === '[object Object]';
    };
    ObservableStructure.isArray = function (obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    };
    ObservableStructure.prototype.observe = function (obj, bindings, attrFullName) {
        if (attrFullName === void 0) { attrFullName = 'this.'; }
        if (typeof obj !== 'object') {
            return;
        }
        var watchedBindings;
        if (this.allWatchedObjects.has(obj)) {
            watchedBindings = this.allWatchedObjects.get(obj);
            watchedBindings = watchedBindings.concat(bindings);
        }
        else {
            watchedBindings = bindings;
        }
        this.allWatchedObjects.set(obj, watchedBindings);
        if (ObservableStructure.isObject(obj)) {
            this.observeObject(obj, bindings, attrFullName);
        }
        if (ObservableStructure.isArray(obj)) {
            this.observeArray(obj, bindings, attrFullName);
        }
    };
    ObservableStructure.prototype.compileBinding = function (obj, attrFullName, params) {
        if (params === void 0) { params = {}; }
        var bindings = this.allWatchedObjects.get(obj);
        window.requestAnimationFrame(function () {
            bindings.forEach(function (binding) {
                var attr = attrFullName;
                var parentAttrPosition;
                do {
                    // 'this.a.b.c'
                    // 'this.a.b'
                    // 'this.a'
                    if (binding.expr.indexOf(attr) !== -1) {
                        binding.compile(params);
                    }
                    parentAttrPosition = attr.lastIndexOf('.');
                    attr = attrFullName.substr(0, parentAttrPosition);
                } while (parentAttrPosition !== 4); // 'this.'
            });
        });
    };
    ObservableStructure.prototype.observeObject = function (obj, bindings, attrParent) {
        var _this = this;
        var $data = {};
        if ('$data' in obj) {
            $data = obj.$data;
        }
        else {
            Object.defineProperty(obj, '$data', { value: $data, writable: true });
        }
        var _loop_1 = function (attrName) {
            if (!obj.hasOwnProperty(attrName)) {
                return "continue";
            }
            if (attrName === '$template' || attrName === '$data') {
                return "continue";
            }
            var attrFullName = attrParent + attrName; // this.foo.bar.attrName
            $data[attrFullName] = obj[attrName];
            this_1.observe(obj[attrName], bindings, attrFullName + '.');
            Object.defineProperty(obj, attrName, {
                get: function () {
                    return $data[attrFullName];
                },
                set: function (value) {
                    $data[attrFullName] = value;
                    _this.observe(value, bindings, attrFullName + '.');
                    _this.compileBinding(obj, attrFullName);
                },
            });
        };
        var this_1 = this;
        for (var attrName in obj) {
            _loop_1(attrName);
        }
    };
    ObservableStructure.prototype.observeArray = function (arr, bindings, attrParent) {
        var _this = this;
        if ('$data' in arr) {
            return;
        }
        var $data = [];
        Object.defineProperty(arr, '$data', { value: $data, writable: true });
        for (var i = 0; i < arr.length; i++) {
            $data[i] = arr[i];
            this.observeArrayDefineIndexProperty(arr, bindings, i, attrParent);
        }
        Object.defineProperty(arr, 'push', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var length = $data.length;
                for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
                    var arg = args_1[_a];
                    $data[length] = arg;
                    _this.observe(arg, bindings, attrParent + '.' + length + '.');
                    _this.observeArrayDefineIndexProperty(arr, bindings, length, attrParent);
                    length++;
                }
                _this.compileBinding(arr, attrParent, { type: 'push' });
                return length;
            },
        });
        Object.defineProperty(arr, 'splice', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function (start, deleteCount) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                start = start == null ? 0 : start < 0 ? $data.length + start : start;
                deleteCount = deleteCount == null ? $data.length - start : deleteCount > 0 ? deleteCount : 0;
                var removed = [];
                while (deleteCount--) {
                    removed.push($data.splice(start, 1)[0]);
                    arr.length = $data.length;
                }
                for (var _a = 0, args_2 = args; _a < args_2.length; _a++) {
                    var arg = args_2[_a];
                    $data.splice(start, 0, arg);
                    _this.observeArrayDefineIndexProperty(arr, bindings, $data.length - 1, attrParent);
                }
                _this.compileBinding(arr, attrParent);
                return removed;
            },
        });
        // TODO: pop, unshift, shift, length
    };
    ObservableStructure.prototype.observeArrayDefineIndexProperty = function (arr, bindings, index, attrParent) {
        var _this = this;
        Object.defineProperty(arr, index, {
            configurable: true,
            enumerable: true,
            get: function () {
                return arr.$data[index];
            },
            set: function (value) {
                arr.$data[index] = value;
                _this.observe(value, bindings, attrParent + '.' + index + '.');
                _this.compileBinding(arr, attrParent, { type: 'update', value: index });
            },
        });
    };
    return ObservableStructure;
}());
exports.ObservableStructure = ObservableStructure;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var todo_data_1 = __webpack_require__(4);
var template = __webpack_require__(5);
var ENTER = 13;
var Todo = /** @class */ (function () {
    function Todo(values) {
        if (values === void 0) { values = {}; }
        this.title = '';
        this.completed = false;
        Object.assign(this, values);
    }
    return Todo;
}());
exports.Todo = Todo;
var TodoComponent = /** @class */ (function () {
    function TodoComponent() {
        this.$template = template;
        this.todos = [];
        this.todoDataService = new todo_data_1.TodoDataService();
        this.todos = this.todoDataService.getAllTodos();
    }
    TodoComponent.prototype.addTodo = function (event) {
        if (event.which == ENTER) {
            this.todoDataService.addTodo(new Todo({ title: event.target.value }));
            event.target.value = '';
        }
    };
    TodoComponent.prototype.toggleTodoComplete = function (event, todo) {
        this.todoDataService.toggleTodoComplete(todo);
    };
    TodoComponent.prototype.removeTodo = function (event, todo) {
        this.todoDataService.deleteTodoById(todo.id);
        this.todos = this.todoDataService.getAllTodos();
    };
    return TodoComponent;
}());
exports.TodoComponent = TodoComponent;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var TodoDataService = /** @class */ (function () {
    function TodoDataService() {
        this.lastId = 0;
        this.todos = [];
    }
    TodoDataService.prototype.addTodo = function (todo) {
        if (!todo.id) {
            todo.id = ++this.lastId;
        }
        this.todos.push(todo);
        return this;
    };
    TodoDataService.prototype.deleteTodoById = function (id) {
        this.todos = this.todos
            .filter(function (todo) { return todo.id !== id; });
        return this;
    };
    TodoDataService.prototype.updateTodoById = function (id, values) {
        if (values === void 0) { values = {}; }
        var todo = this.getTodoById(id);
        if (!todo) {
            return null;
        }
        Object.assign(todo, values);
        return todo;
    };
    TodoDataService.prototype.getAllTodos = function () {
        return this.todos;
    };
    TodoDataService.prototype.getTodoById = function (id) {
        return this.todos
            .filter(function (todo) { return todo.id === id; })
            .pop();
    };
    TodoDataService.prototype.toggleTodoComplete = function (todo) {
        var updatedTodo = this.updateTodoById(todo.id, {
            completed: !todo.completed
        });
        return updatedTodo;
    };
    return TodoDataService;
}());
exports.TodoDataService = TodoDataService;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = "<header class=\"header\">\n\t<h1>todos</h1>\n\t<input class=\"new-todo\" placeholder=\"What needs to be done?\" autofocus $onkeypress=\"this.addTodo($event)\">\n</header>\n<section class=\"main\">\n\t<input id=\"toggle-all\" class=\"toggle-all\" type=\"checkbox\">\n\t<label for=\"toggle-all\">Mark all as complete</label>\n\t<ul class=\"todo-list\">\n\t\t<li $for=\"this.todos\" class=\"completed\" $attr=\"{class: this.todos[$index].completed ? 'completed': ''}\">\n\t\t\t<div class=\"view\">\n\t\t\t\t<input class=\"toggle\" type=\"checkbox\" checked $onclick=\"this.toggleTodoComplete($event, this.todos[$index])\">\n\t\t\t\t<label>{{ this.todos[$index].title }}</label>\n\t\t\t\t<button class=\"destroy\" $onclick=\"this.removeTodo($event, this.todos[$index])\"></button>\n\t\t\t</div>\n\t\t</li>\n\t</ul>\n</section>\n<footer class=\"footer\" $if=\"this.todos.length > 0\">\n\t<span class=\"todo-count\">\n\t\t<strong>{{ this.todos.length }}</strong> {{ this.todos.length == 1 ? 'item' : 'items' }} left\n\t</span>\n\t<button class=\"clear-completed\" $if=\"this.todos.filter(i => i.completed == true).length > 0\">Clear completed</button>\n</footer>\n"

/***/ })
/******/ ]);