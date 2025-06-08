class Task {
    id = -1;
    status = false;
    collapsed = true;
    constructor(title, description) {
        this.title = title;
        this.description = description;
    }

    updateTitle(title) {
        this.title = title; this.updateDisplay();
    }
    updateDescripton(description) {
        this.description = description; this.updateDisplay();
    }

    toggle() {
        this.status = !this.status;
    }

    toggleCollapse() {
        this.collapsed = !this.collapsed;
    }

    collapse() {
        this.collapsed = false;
    }

    get progress() {
        return this.status;
    }
}

class Category {
    id = -1;
    tasks = [];
    collapsed = false;
    constructor(title) {
        this.title = title;
    }

    addTask(task) {
        this.tasks.push(task);
    }

    getTask(taskID) {
        return this.tasks.find((task) => { return task.id === taskID });
    }

    removeTask(task) {
        if (this.tasks.includes(task)) {
            this.tasks.splice(this.tasks.indexOf(task), 1);
        }
    }

    collapse() {
        this.collapsed = true;
    }

    expand() {
        this.collapsed = false;
    }
}

const TaskList = new class {
    #lastID = 0;
    categories = {};
    EmptyTask;

    constructor() {
        this.EmptyTask = new Task('Empty task',
            `
            If you see this task, some program logic was failed
              :(
            `);

        this.categories = new Map();

        this.load();
    }

    createCategory(refence) {
        const category = refence;
        category.id = this.lastID;

        this.categories.set(category.title, category);

        const [displayedCategory, collapsedCategory] = UI.displayCategory(
            category
        );
        displayedCategory.action.onclick = () => {
            category.collapse();
            UI.displayCategory(category);
        }

        collapsedCategory.Element.onclick = () => {
            category.expand();
            UI.displayCategory(category);
        }
        this.save();

        return category;
    }

    createTask(categoryTitle, refence) {
        const category = this.getCategory(categoryTitle);
        if (!category) throw new Error(`There is no category named '${categoryTitle}'`);
        const task = refence;
        if (!task) throw new Error(`You have not provide a task refence`);
        task.id = this.lastID;
        category.addTask(task);

        const displayedTask = UI.displayTask(categoryTitle, task);

        displayedTask.progress.onclick = () => {
            task.toggle();
            UI.displayTask(categoryTitle, task);
        };
        displayedTask.action.onclick = () => {
            task.toggleCollapse();
            UI.displayTask(categoryTitle, task);
        }

        this.save();

        return task;
    }

    getCategory(title) {
        return this.categories.get(title)
    }
    get lastID() {
        return this.#lastID++;
    }

    save() {
        console.log('save')
        localStorage.setItem('hys-to-do-list-save', this.toJSON());
    }

    load() {
        const saveJSON = localStorage.getItem('hys-to-do-list-save');
        if (!saveJSON) return;
        this.fromJSON(saveJSON);
    }

    toJSON() {
        const object = { categories: [] };
        this.categories.values().forEach(category => {
            object.categories.push(category);
        });

        return JSON.stringify(object)
    }

    fromJSON(string) {
        this.#lastID = 0;
        const json = JSON.parse(string);
        json.categories.forEach(categoryRef => {
            const category = this.createCategory(new Category(categoryRef.title));
            categoryRef.tasks.forEach(task => {
                this.createTask(category.title, task);
            });
        });
        UI.displayTaskList(this);
    }
};

