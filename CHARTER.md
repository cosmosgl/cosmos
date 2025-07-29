# cosmos.gl Charter

## **Section 0: Guiding Principles**

**Mission:** Provide the web development community with a high-performance framework for visualizing network graphs and scatter plots.

**Vision:** Deliver fast, robust, open-source data visualization tools that empower interactive, scalable analysis in the browser.

**Values:**

- **Performance First:** Prioritize speed and efficiency in every feature and implementation.  
- **Accessibility:** Ensure the API is intuitive and the tooling easy to adopt, lowering barriers for developers.  
- **Community:** Foster open collaboration, welcoming contributions and feedback.  
- **Transparency:** Maintain clear documentation, benchmarks, and decision-making processes.

## **Section 1: Scope**

cosmos.gl is a browser-native, GPU-accelerated force-directed graph layout and rendering engine designed to visualize and interact with massive, complex datasets at scale. By leveraging WebGL, it delivers fast simulations and real-time rendering of millions of nodes and edges directly in the browser. cosmos.gl bridges the gap between high-performance data visualization and interactive web-based research workflows, serving developers, researchers, and analysts. Its value lies in unlocking scalable, explainable graph exploration for AI, biotech, finance, and data science stakeholders.

### **1.1: In-scope**

- GPU-accelerated graph algorithms  
- WebGL- and WebGPU-based rendering of large-scale network graph and machine learning embeddings  
- Browser-native integration with frontend tooling and workflows

### **1.2: Out-of-Scope**

- Server-side computation, backend data processing and pipelines
- Native desktop or mobile applications (outside browser environment)
- Direct integration with domain-specific tools

## **Section 2: Relationship with OpenJS Foundation CPC**

Technical leadership of the cosmos.gl project is delegated to the cosmos.gl Technical Steering Committee (TSC) by the OpenJS Cross Project Council (CPC). Amendments to this charter require approval from both the CPC, through its [decision-making process](https://github.com/openjs-foundation/cross-project-council/blob/master/CPC-CHARTER.md#section-9-decision-making), and the TSC.

## **Section 3: Technical Steering Committee (TSC)**

TSC members may attend meetings, participate in discussions, and vote on all matters before the TSC.

TSC memberships are not time-limited. There is no maximum size of the TSC. 

There is no specific set of requirements or qualifications for TSC membership beyond these rules. A TSC member can be removed from the TSC by voluntary resignation or by a standard TSC motion.

The TSC shall meet regularly using tools that enable participation by the community. The meeting shall be directed by the TSC chairperson. Responsibility for directing individual meetings may be delegated by the TSC chairperson to any other TSC member. Minutes or an appropriate recording shall be taken and made available to the community through accessible public postings.

TSC members are expected to regularly participate in TSC activities.

The TSC chairperson is elected by a simple majority vote of all TSC members. The chairperson serves until they resign or are replaced by a TSC vote. Any TSC member may call for a vote at any time, provided the proposal is made in writing and shared with the full TSC. Votes may be held in meetings or asynchronously using any communication tool commonly used by the TSC.

## **Section 4: Roles & Responsibilities**
The roles and responsibilities of cosmos.gl's TSC are described in [GOVERNANCE.md](./GOVERNANCE.md).

### **Section 4.1 Project Operations & Management**
The Project Operations & Management processes are defined in [GOVERNANCE.md](./GOVERNANCE.md).

### **Section 4.2: Decision-making, Voting, and/or Elections**

Project decisions shall operate under a model of Lazy Consensus by default. The TSC shall define appropriate guidelines for implementing Lazy Consensus (e.g., notification periods, review windows) within the development process.

When consensus cannot be reached, the TSC shall decide via public voting.

Each vote presents the available options in a format that supports clear expression of member preferences—this may include polls, emoji reactions, checklists, or comparable methods. TSC members may vote for one or more options or abstain. Unless otherwise specified, the winning option is the one that receives the greatest support among participating members.

For decisions involving three or more options, the TSC may optionally conduct pairwise comparisons between all candidates. In such cases, the winner is the candidate who secures a simple majority against every other candidate in head-to-head matchups (Condorcet winner). All votes are public, and voting activity may be adjusted until the close of the voting period.

## **Section 5: Definitions**
### **Agenda Item**

An agenda item is a specific topic, proposal, or issue scheduled for discussion or decision during a TSC meeting. Examples include proposed technical changes, governance matters, or any subject requiring TSC review or input. Agenda items are published in advance to allow TSC members and the community to prepare for discussion or decision-making.