export const DOMAIN_OPTIONS = [
  { id: "Software", label: "Software Engineering & Data", icon: "Code2" },
  { id: "Hardware", label: "Hardware & Embedded Systems", icon: "Cpu" }
];

export const ROLE_PRESETS = [
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    domain: "Software",
    level: "Mid-Senior",
    coreSkills: ["React", "JavaScript", "TypeScript", "HTML5/CSS3", "State Management", "Web Performance"],
    description: "Build reactive, accessible, high-performance UI architectures and responsive web experiences."
  },
  {
    id: "backend-dev",
    title: "Backend Developer",
    domain: "Software",
    level: "Mid-Senior",
    coreSkills: ["Node.js", "Python", "REST/GraphQL APIs", "SQL/PostgreSQL", "Redis", "Microservices", "Docker"],
    description: "Design scalable backend services, robust database architectures, caching, and secure API gateways."
  },
  {
    id: "fullstack-eng",
    title: "Full Stack Engineer",
    domain: "Software",
    level: "Mid-Senior",
    coreSkills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Cloud Deployment", "System Design"],
    description: "End-to-end web engineering covering modern interactive interfaces, API design, and distributed persistence."
  },
  {
    id: "ai-ml-eng",
    title: "AI / ML Engineer",
    domain: "Software",
    level: "Mid-Senior",
    coreSkills: ["Python", "PyTorch", "TensorFlow", "LLMs", "RAG Pipelines", "Vector Databases", "MLOps"],
    description: "Architect machine learning pipelines, fine-tune LLMs, vector search, and productionize AI inference systems."
  },
  {
    id: "data-scientist",
    title: "Data Analyst / Scientist",
    domain: "Software",
    level: "Mid-Senior",
    coreSkills: ["Python", "SQL", "Pandas", "Scikit-Learn", "Data Visualization", "Statistical Analysis"],
    description: "Transform complex data landscapes into actionable intelligence, predictive models, and executive analytics."
  },
  {
    id: "devops-cloud",
    title: "DevOps & Cloud Engineer",
    domain: "Software",
    level: "Mid-Senior",
    coreSkills: ["AWS/GCP", "Kubernetes", "Docker", "CI/CD Pipelines", "Terraform", "Monitoring & Prometheus"],
    description: "Automate zero-downtime deployments, infrastructure-as-code, high-availability clusters, and observability."
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Analyst",
    domain: "Software",
    level: "Mid-Senior",
    coreSkills: ["Network Security", "Penetration Testing", "OWASP Top 10", "Cryptography", "SIEM", "Incident Response"],
    description: "Safeguard cloud infrastructure, analyze vulnerabilities, audit codebases, and maintain threat mitigation protocols."
  },
  {
    id: "embedded-eng",
    title: "Embedded Systems Engineer",
    domain: "Hardware",
    level: "Mid-Senior",
    coreSkills: ["C/C++", "RTOS", "Microcontrollers (ARM/STM32/ESP32)", "UART/SPI/I2C", "Firmware Debugging"],
    description: "Develop deterministic firmware, low-level device drivers, and real-time sensor processing pipelines."
  },
  {
    id: "vlsi-hw-eng",
    title: "VLSI & Hardware Designer",
    domain: "Hardware",
    level: "Mid-Senior",
    coreSkills: ["Verilog/VHDL", "FPGA Programming", "PCB Design", "Digital Signal Processing", "Timing Analysis"],
    description: "Design digital logic, synthesize FPGA architectures, custom PCB schematics, and ASIC verification."
  },
  {
    id: "iot-robotics",
    title: "IoT & Robotics Engineer",
    domain: "Hardware",
    level: "Mid-Senior",
    coreSkills: ["ROS/ROS2", "Robotics Kinematics", "C++", "Sensors & Actuators", "MQTT", "Edge AI"],
    description: "Integrate autonomous robotics motion planning, edge computer vision, and IoT telemetry architectures."
  }
];

export function detectDomainFromRole(roleTitle) {
  const role = ROLE_PRESETS.find(r => r.title.toLowerCase() === (roleTitle || "").toLowerCase());
  if (role) return role.domain;
  const hwKeywords = ["embedded", "hardware", "vlsi", "fpga", "pcb", "robotics", "iot", "firmware", "circuit"];
  const isHw = hwKeywords.some(kw => (roleTitle || "").toLowerCase().includes(kw));
  return isHw ? "Hardware" : "Software";
}
