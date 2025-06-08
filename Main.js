const Main = new class {
    selection = {
        allowSelection: false,
        objects: [],
        toggleObject(Object) {
            if (this.objects.includes(Object)) {
                this.removeObject(Object);
            } else {
                this.addObject(Object);
            }
        },
        addObject(Object) {
            this.objects.push(Object);
            UI.markDeletion(Object);
        },
        removeObject(Object) {
            const index = this.objects.indexOf(Object)
            if (index < 0) return;
            this.objects.splice(index, 1);
            UI.unmarkDeletion(Object);
        },

        start() {
            this.allowSelection = true;
            this.objects = [];
        },
        cancel() {
            this.allowSelection = false;
        },
        processObject(Object) {
            if (!document.contains(Object)) return;
            switch (Object.type) {
                case 'task':
                    Main.removeTask(Object.category, Object.name);
                    break;
                case 'category':
                    Main.removeCategory(Object.name);
                    break;
                default:
                    break;
            }
        },

        process() {
            this.allowSelection = false;
            while (this.objects.length > 0) {
                this.processObject(this.objects.pop());
            }
            UI.displayCategorySelect();
            TaskList.save();
        }
    }
    constructor() {
        UI.actions.taskConstructor.button.addEventListener('click', () => {
            TaskList.getCategory(UI.actions.taskConstructor.categoryInput.value).expand();
            this.addTask(
                UI.actions.taskConstructor.categoryInput.value,
                UI.actions.taskConstructor.titleInput.value,
                UI.actions.taskConstructor.descriptionInput.value
            );
            UI.clearInputs();
        });
        UI.actions.categoryConstructor.button.addEventListener('click', () => {
            const title = UI.actions.categoryConstructor.titleInput.value;
            const refence = TaskList.getCategory(title);
            if (!refence) {
                this.addCategory(
                    title
                );
                UI.clearInputs();
            } else {
                TaskList.getCategory(title).expand();
                UI.displayCategory(refence);
            }
        });
        UI.actions.destructor.cancelDeletion.addEventListener('click', () => {
            this.selection.cancel();
            UI.actions.destructor.active(false);
        })
        UI.actions.destructor.startDeletion.addEventListener('click', () => {
            this.selection.start();
            UI.actions.destructor.active(true);
        })
        UI.actions.destructor.confirmDeletion.addEventListener('click', () => {
            this.selection.process();
            UI.actions.destructor.active(false);
        })

        document.addEventListener('click', (e) => {
            if (this.selection.allowSelection) {
                const Object = e.target.closest('.object');
                if (!Object) return;
                this.selection.toggleObject(Object)
            }
        });
    }
    addTask(categoryTitle, taskTitle, taskDescription) {
        if (!TaskList.getCategory(categoryTitle))
            this.addCategory(categoryTitle)
        const category = TaskList.getCategory(categoryTitle);
        const task = TaskList.createTask(categoryTitle, new Task(taskTitle, taskDescription));
        UI.displayCategory(category);
    }
    addCategory(categoryTitle) {
        TaskList.createCategory(new Category(categoryTitle))
    }
    removeTask (categoryTitle, taskID) {
        TaskList.categories.get(categoryTitle).removeTask(taskID)
        UI.removeTask(categoryTitle, taskID);
    }
    removeCategory(categoryTitle) {
        TaskList.categories.delete(categoryTitle);
        UI.removeCategory(categoryTitle);
    }
};


UI.selectConstructor('categoryConstructor');

if (TaskList.categories.size === 0) {
    Main.addTask('Home', 'Mop the floor', 'Do it');
    Main.addTask('Work', 'Report', 'Write a report to boss')
}
