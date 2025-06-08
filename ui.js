const UI = new class {
    templates = [];
    actions = {
        typeSelector: {

        },
        taskConstructor: {
            show(boolean) {
                UI.classToggle(this.Element, !boolean, 'hide');
                UI.classToggle(this.button, boolean, 'selected');
            }
        },
        categoryConstructor: {
            show(boolean) {
                UI.classToggle(this.Element, !boolean, 'hide');
                UI.classToggle(this.button, boolean, 'selected');
            }
        },
        constructors: [],

        destructor: {
            active(boolean) {
                UI.classToggle(this.Element, boolean, 'active');
            }
        }
    };
    constructor() {
        const allTemplatesDiv = document.getElementsByTagName('template');

        for (let Element of allTemplatesDiv) {
            this.templates[Element.id] = Element.content.children[0];
        }
        this.collapsedCategories = document.getElementById('collapsed-categories');
        this.content = document.getElementById('content');


        this.actions.Element = document.getElementById('actions');

        this.actions.typeSelector.task = document.getElementById('task-constructor-selection');
        this.actions.typeSelector.category = document.getElementById('category-constructor-selection');

        this.actions.taskConstructor.Element = document.getElementById('task-constructor');
        this.actions.taskConstructor.titleInput = document.getElementById('task-title');
        this.actions.taskConstructor.descriptionInput = document.getElementById('task-description');
        this.actions.taskConstructor.categoryInput = document.getElementById('category-select');
        this.actions.taskConstructor.button = document.getElementById('create-task-button');

        this.actions.categoryConstructor.Element = document.getElementById('category-constructor');
        this.actions.categoryConstructor.titleInput = document.getElementById('category-title');
        this.actions.categoryConstructor.button = document.getElementById('create-category-button');

        this.actions.constructors.push(
            this.actions.taskConstructor,
            this.actions.categoryConstructor
        );

        this.actions.destructor.Element = document.getElementById('destructor');
        this.actions.destructor.cancelDeletion = document.getElementById('cancel-deletion');
        this.actions.destructor.startDeletion = document.getElementById('start-deletion');
        this.actions.destructor.confirmDeletion = document.getElementById('confirm-deletion');

        this.actions.destructor.cancelDeletion.append(this.getTemplate('close-icon'));
        this.actions.destructor.confirmDeletion.append(this.getTemplate('confirm-icon'));
    }

    getTemplate(name) {
        return this.templates[name].cloneNode(true);
    }

    getTask(categoryTitle, taskRef) {
        if (!document.getElementById(`task-${taskRef.id}`)) {
            const category = this.getCategoryBytitle(categoryTitle);
            const template = this.getTemplate('regular-task');
            template.id = `task-${taskRef.id}`;
            template.type = 'task';
            template.name = taskRef.id;

            template.category = categoryTitle;
            template.querySelector('.progress').append(this.getTemplate('check-icon'));
            template.querySelector('.action').append(this.getTemplate('dropdown-arrow-icon'));
            category.body.append(template);
        }
        const task = document.getElementById(`task-${taskRef.id}`);

        return {
            Element: task,
            head: task.querySelector('.head'),
            body: task.querySelector('.body'),
            title: task.querySelector('.title'),
            description: task.querySelector('.description'),

            progress: task.querySelector('.progress'),
            action: task.querySelector('.action')
        }
    }

    getCategoryBytitle(categoryTitle) {
        if (!document.getElementById(`category-${categoryTitle}`)) {
            const template = this.getTemplate('category');
            template.id = `category-${categoryTitle}`;
            template.type = 'category';
            template.name = categoryTitle;
            this.content.append(template);
            this.addCategorySelect(categoryTitle);
        }

        const category = document.getElementById(`category-${categoryTitle}`);
        return {
            Element: category,
            head: category.querySelector('.head'),
            body: category.querySelector('.body'),
            title: category.querySelector('.title'),

            action: category.querySelector('.action'),
        };
    }

    getCollapsedCategoryByTitle(categoryTitle) {
        if (!document.getElementById(`collapsed-category-${categoryTitle}`)) {
            const template = this.getTemplate('collapsed-category');
            template.id = `collapsed-category-${categoryTitle}`;
            this.collapsedCategories.append(template)
        }
        const category = document.getElementById(`collapsed-category-${categoryTitle}`);

        return {
            Element: category,
            title: category.querySelector('.title'),
        }
    }

    getCollapsedCategory(categoryRef) {
        return this.getCollapsedCategoryByTitle(categoryRef.title);
    }

    getCategory(categoryRef) {
        return this.getCategoryBytitle(categoryRef.title);
    }

    addCategorySelect(option) {
        const template = this.getTemplate('category-select-option');
        template.textContent = option;
        this.actions.taskConstructor.categoryInput.append(template);
    }

    displayCategorySelect() {
        this.actions.taskConstructor.categoryInput.innerHTML = '';
        for (let category of document.getElementsByClassName('category')) {
            this.addCategorySelect(category.querySelector('.title').textContent);
        }
    }

    displayTask(categoryTitle, taskRef) {
        const task = this.getTask(categoryTitle, taskRef);
        task.title.textContent = taskRef.title;
        task.description.textContent = taskRef.description;
        this.classToggle(task.Element, taskRef.progress, 'completed');
        this.classToggle(task.Element, taskRef.collapsed, 'collapsed')
        return task;
    }
    displayCategory(categoryRef) {
        const category = this.getCategory(categoryRef);
        const collapsed = this.getCollapsedCategory(categoryRef);
        category.title.textContent = categoryRef.title;
        this.classToggle(category.Element, categoryRef.collapsed, 'collapsed');

        collapsed.title.textContent = categoryRef.title;
        this.classToggle(collapsed.Element, !categoryRef.collapsed, 'hidden');
        return [category, collapsed];
    }

    displayTaskList(TaskList) {
        TaskList.categories.values().forEach(category => {
            this.displayCategory(category);
            category.tasks.forEach(task => {
                this.displayTask(category.title, task);
            });
        });
    }

    removeTask(categoryTitle, taskID) {
        const task = this.getTask(categoryTitle, { id: taskID });
        task.Element.outerHTML = '';
    }

    removeCategory(categoryTitle) {
        this.getCategoryBytitle(categoryTitle).Element.outerHTML =
            this.getCollapsedCategoryByTitle(categoryTitle).Element.outerHTML =
            '';
    }

    selectConstructor(name) {
        this.actions.constructors.forEach(constructor => {
            constructor.show(false);
        });
        this.actions[name].show(true);
    }

    markDeletion(Element) {
        this.classToggle(Element, true, 'delete-selection');
    }

    unmarkDeletion(Element) {
        this.classToggle(Element, false, 'delete-selection');
    }

    clearInputs() {
        this.actions.taskConstructor.titleInput.value =
            this.actions.categoryConstructor.titleInput.value =
            this.actions.taskConstructor.descriptionInput.value =
            '';
    }

    classToggle(Element, boolean, className) {
        // if (boolean)
        //     Element.classList.add(className)
        // else
        //     Element.classList.remove(className)
        Element.classList[boolean ? 'add' : 'remove'](className);
    }
}();