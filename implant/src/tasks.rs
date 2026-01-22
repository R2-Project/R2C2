use crate::commands;
use serde::Deserialize;
use serde::Serialize;
use std::collections::VecDeque;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub agent_id: String,
    pub command: String,
    pub args: Vec<String>,
    pub status: String,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskResult {
    pub task: Task,
    pub output: String,
}

pub struct TasksManager {
    tasks: VecDeque<Task>,
    pub completed_tasks: Vec<TaskResult>,
}

impl TasksManager {
    pub fn new() -> Self {
        TasksManager {
            tasks: VecDeque::new(),
            completed_tasks: Vec::new(),
        }
    }

    pub fn queue(&mut self, task: Task) -> Result<(), String> {
        println!("Queueing task: {:?}", task); // Debug print
        self.tasks.push_back(task);

        Ok(())
    }

    pub fn dispatch(&mut self) -> Result<(), String> {
        if self.tasks.is_empty() {
            return Ok(println!("No tasks to dispatch."));
        }

        while let Some(task) = self.tasks.pop_front() {
            println!("Dispatching task: {:?}", task);
            match task.command.as_str() {
                "ls" => {
                    let result = commands::ls_command();
                    println!("ls_command result: {:?}", result);
                    let task_result = TaskResult {
                        task: task.clone(),
                        output: format!("{:?}", result),
                    };
                    self.completed_tasks.push(task_result);
                }
                "shell" => {
                    let result = commands::shell();
                    println!("shell command result: {:?}", result);
                    let task_result = TaskResult {
                        task: task.clone(),
                        output: format!("{:?}", result),
                    };
                    self.completed_tasks.push(task_result);
                }
                _ => {
                    println!("Unknown command: {}", task.command);
                }
            };
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_queue_task() {
        let mut tasks = TasksManager {
            tasks: VecDeque::new(),
            completed_tasks: vec![],
        };

        let task = Task {
            id: "abc123".into(),
            agent_id: "agent1".into(),
            command: "ls".into(),
            status: "pending".into(),
            args: vec![],
            timestamp: "2024-01-01T00:00:00Z".into(),
        };

        assert!(tasks.queue(task).is_ok());
        assert_eq!(tasks.tasks.len(), 1);
        assert!(tasks.dispatch().is_ok());
    }
}
