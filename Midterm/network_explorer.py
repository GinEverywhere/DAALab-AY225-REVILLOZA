from typing import Dict, NamedTuple

# Constants
DIVIDER_NODE = "+----------+----------+----------+----------+"
DIVIDER_TABLE = "+--------+--------+--------+--------+--------+"
HEADER_NODE = "| Target   | Dist     | Time     | Fuel     |"
HEADER_TABLE = f"{'| From':<8} | {'To':<8} | {'Dist':<8} | {'Time':<8} | {'Fuel':<8} |"


class Edge(NamedTuple):
    """Represents an edge with distance, time, and fuel consumption."""
    distance: float
    time: float
    fuel: float


# Graph represented as adjacency list with Edge namedtuples
GRAPH: Dict[int, Dict[int, Edge]] = {
    1: {2: Edge(10, 15, 1.2), 6: Edge(10, 15, 1.2)},
    2: {1: Edge(10, 15, 1.2), 3: Edge(12, 25, 1.5), 5: Edge(12, 25, 1.5), 6: Edge(10, 15, 1.2)},
    3: {2: Edge(12, 25, 1.5), 4: Edge(12, 25, 1.5), 5: Edge(14, 25, 1.5)},
    4: {},
    5: {2: Edge(12, 25, 1.5), 3: Edge(12, 25, 1.5), 4: Edge(14, 25, 1.2), 6: Edge(10, 25, 1.5)},
    6: {1: Edge(10, 15, 1.2), 2: Edge(10, 15, 1.2), 3: Edge(10, 25, 1.3), 4: Edge(10, 25, 1.5), 5: Edge(10, 25, 1.5)}
}


def analyze_node(node_id: int) -> None:
    """
    Display analysis of a specific node including its neighbors and aggregate metrics.
    
    Args:
        node_id: The node ID to analyze
    """
    if node_id not in GRAPH:
        print("Invalid Node ID.")
        return

    neighbors = GRAPH[node_id]
    if not neighbors:
        print(f"\nNode {node_id} is a sink node.")
        return

    print(f"\n--- Analysis for Node {node_id} ---")
    print(DIVIDER_NODE)
    print(HEADER_NODE)
    print(DIVIDER_NODE)

    distances, times, fuels = [], [], []
    for neighbor, edge in neighbors.items():
        print(f"| {neighbor:<8} | {edge.distance:<8} | {edge.time:<8} | {edge.fuel:<8} |")
        distances.append(edge.distance)
        times.append(edge.time)
        fuels.append(edge.fuel)

    print(DIVIDER_NODE)
    print(f"| Totals   | {sum(distances):<8} | {sum(times):<8} | {sum(fuels):<8} |")
    print(DIVIDER_NODE)


def show_full_table() -> None:
    """Display a complete table of all connections in the graph."""
    print(f"\n{HEADER_TABLE}")
    print(DIVIDER_TABLE)
    for node, neighbors in GRAPH.items():
        for target, edge in neighbors.items():
            print(f"| {node:<6} | {target:<6} | {edge.distance:<6} | {edge.time:<6} | {edge.fuel:<6} |")
    print(DIVIDER_TABLE)


def display_menu() -> None:
    """Display the main menu options."""
    print("\n" + "="*40)
    print("       Network Explorer")
    print("="*40)
    print("1. Node Analysis      - View node connections")
    print("2. Network Map        - View all connections")
    print("3. Exit")
    print("="*40)


def get_user_choice() -> str:
    """Get and return user input."""
    return input("\n📍 Enter your choice (1-3): ").lower().strip()


def main() -> None:
    """Main application loop."""
    print("\n✓ Welcome to Network Explorer!\n")
    
    while True:
        display_menu()
        choice = get_user_choice()

        if choice == '1':
            try:
                node_input = input("\n📍 Enter Node ID (1-6): ")
                node = int(node_input)
                analyze_node(node)
            except ValueError:
                print("❌ Invalid input. Please enter a valid number.")
            finally:
                input("\nPress Enter to return to menu")

        elif choice == '2':
            show_full_table()
            input("\nPress Enter to return to menu")

        elif choice == '3':
            print("\n👋 Thank you for using Network Explorer. Goodbye!\n")
            break

        else:
            print("❌ Invalid choice. Please enter 1, 2, or 3.")


if __name__ == "__main__":
    main()