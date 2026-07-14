---
title: "Python Engineering Practices: Applying Engineering Judgment in Python"
date: 2026-07-02
category: Engineering Practice
excerpt: "Translating general engineering principles into idiomatic Python — readable before clever, explicit before magical, simple before over-engineered."
---

> 💡 This doc translates general engineering principles into idiomatic Python.

## Core idea

Python code should be simple, readable, explicit, and easy to change.

Good Python is not code that uses the most advanced Python feature. Good Python is code that feels natural to experienced Python developers and is easy for another engineer to understand, test, and maintain.

The goal is:

> Readable before clever.
> Explicit before magical.
> Simple before over-engineered.
> Correct before optimized.

Python gives you a lot of freedom. Engineering judgment is knowing how much structure to add before the code becomes either messy or over-designed.

## 1. Use Python naming conventions

Python has strong naming conventions. Following them makes your code feel natural to other Python developers.

General Python naming:

- functions — `snake_case`
- variables — `snake_case`
- classes — `PascalCase`
- constants — `UPPER_CASE`
- internal/private helpers — `_leading_underscore`

Good:

```python
def clear_rows():
    ...

current_height = 0
piece_type = "T"

class Board:
    ...

BOARD_WIDTH = 10
```

Awkward in Python:

```python
def clearRows():
    ...

currentHeight = 0
pieceType = "T"
```

Why this matters:

- It makes the code easier for Python developers to scan.
- It works naturally with Python linters and formatters.
- It signals that you understand Python style, not just Python syntax.

### About `_private` names

Python does not have true private methods in the same way as some other languages. A leading underscore means:

> This is internal. Do not use it directly unless you know what you are doing.

```python
def _normalize_piece(piece_name: str) -> str:
    return piece_name.upper()
```

This is a convention, not a hard rule enforced by the language. Use it for helper functions or internal methods that are not part of the public API.

## 2. Use clear names, not clever names

Python code should read close to English.

Bad:

```python
def cr(r):
    ...
```

Better:

```python
def clear_rows(rows):
    ...
```

Bad:

```python
x = 10
y = 4
z = []
```

Better:

```python
board_width = 10
drop_column = 4
occupied_cells = []
```

Short names are okay only when the context is very small and obvious:

```python
for x, y in cells:
    ...
```

But for important domain concepts, use meaningful names. Good names reduce the need for comments.

## 3. Use type hints for clarity

Python is dynamically typed, but type hints make code easier to understand and safer to refactor.

Good:

```python
def can_place(
    occupied: set[tuple[int, int]],
    cells: tuple[tuple[int, int], ...],
    x: int,
    y: int,
    width: int,
) -> bool:
    ...
```

This tells the reader:

> `occupied` is a set of coordinate pairs.
> `cells` is a fixed collection of relative coordinates.
> `x` and `y` are integers.
> The function returns True or False.

Type hints are especially useful for function arguments, function return values, dataclasses, complex data structures, and public interfaces.

They are less necessary for obvious local variables. Usually `height = 0` is enough — you do not need `height: int = 0` unless it improves clarity.

**Trade-off:** Do not make type hints so complex that they become harder to read than the code itself.

## 4. Use dataclasses when the data has meaning

A `dataclass` is useful when you have structured data with named fields.

Bad:

```python
move = ("T", 4)
```

The reader has to remember that index 0 means the piece name and index 1 means the x position.

Better:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Move:
    piece_name: str
    x: int
```

Now the code reads clearly:

```python
move.piece_name
move.x
```

A dataclass is useful for concepts like `Move`, `Piece`, `Coordinate`, `Config`, `Result`, `User`, `Order`, or `Job`.

```python
@dataclass(frozen=True)
class Piece:
    name: str
    cells: tuple[tuple[int, int], ...]
```

Use `frozen=True` when the object should not change after creation.

Why this matters:

- It makes data easier to understand.
- It reduces mistakes from tuple/list ordering.
- It makes invalid usage more obvious.
- It gives the domain concept a name.

**Trade-off:** Do not create dataclasses for everything. If the data is temporary and obvious, a tuple or dictionary may be enough.

## 5. Prefer simple built-in data structures

Python's built-in data structures are powerful. Use them well before inventing complex classes.

Common structures:

- `list` — ordered collection
- `dict` — key-value lookup
- `set` — unique values and fast membership checks
- `tuple` — fixed group of values
- `deque` — efficient queue
- `heapq` — priority queue
- `Counter` — counting items
- `defaultdict` — default values for missing keys

Example: using a set for occupied grid cells.

```python
occupied: set[tuple[int, int]] = set()

if (x, y) in occupied:
    return False
```

This is clearer and faster than scanning a list every time:

```python
for cell in occupied:
    if cell == (x, y):
        return False
```

Good Python often comes from choosing the right simple data structure.

## 6. Avoid unnecessary globals

Global constants are fine:

```python
BOARD_WIDTH = 10
```

Global mutable state is risky. Bad:

```python
occupied = set()

def place_piece(piece):
    occupied.add(piece)
```

This makes the function depend on hidden external state. Better:

```python
class Board:
    def __init__(self, width: int) -> None:
        self.width = width
        self.occupied: set[tuple[int, int]] = set()

    def place(self, cells: tuple[tuple[int, int], ...]) -> None:
        self.occupied.update(cells)
```

or:

```python
def place_piece(
    occupied: set[tuple[int, int]],
    cells: tuple[tuple[int, int], ...],
) -> set[tuple[int, int]]:
    return occupied | set(cells)
```

Why this matters:

- Hidden state makes tests harder.
- Hidden state makes bugs harder to trace.
- Hidden state makes functions less reusable.

Use globals for constants. Be careful with globals that change.

## 7. Avoid magic numbers and repeated rules

A magic number is a raw value whose meaning is not obvious.

Bad:

```python
if x >= 10:
    return False
```

Better:

```python
BOARD_WIDTH = 10

if x >= BOARD_WIDTH:
    return False
```

Even better when the value may vary:

```python
class Board:
    def __init__(self, width: int = 10) -> None:
        self.width = width
```

Then `board = Board(width=12)`.

Why this matters:

- A meaningful name explains the rule.
- Changing the rule is safer.
- You avoid updating the same value in many places.

Not every number needs a constant. `for i in range(2):` is fine if `2` is obvious in context. Name values that represent business rules, domain rules, configuration, or repeated assumptions.

## 8. Keep functions small and focused

Python makes it easy to write long scripts. But production-quality Python should still have clear boundaries.

Bad:

```python
def solve(input_string):
    # parse input
    # validate input
    # simulate pieces
    # clear rows
    # calculate height
    # print output
    ...
```

Better:

```python
def parse_moves(input_string: str) -> list[Move]:
    ...

def validate_move(move: Move) -> None:
    ...

class Board:
    def drop(self, piece: Piece, x: int) -> None:
        ...

    def can_place(self, piece: Piece, x: int, y: int) -> bool:
        ...

    def clear_rows(self) -> None:
        ...

    def height(self) -> int:
        ...
```

A function should have one clear job. Good function names usually start with verbs: `parse_moves`, `validate_input`, `clear_rows`, `calculate_height`, `load_config`, `send_request`.

**Trade-off:** Do not split code so much that the reader has to jump through ten tiny functions to understand one simple operation. Good Python is cohesive, not fragmented.

## 9. Keep the main flow obvious

A Python program should have an obvious entry point.

Good:

```python
def solve(input_string: str) -> int:
    moves = parse_moves(input_string)
    board = Board(width=BOARD_WIDTH)

    for move in moves:
        piece = PIECES[move.piece_name]
        board.drop(piece, move.x)

    return board.height()
```

This reads like a summary — parse input, create board, process moves, return height. The details are hidden in well-named functions, but the main flow is still visible.

Bad:

```python
def solve(input_string):
    # 120 lines of nested logic
    ...
```

The reviewer should not need to hunt for the main idea.

## 10. Validate input at the boundary

Do not let messy external input leak into the core logic.

Bad:

```python
def drop(piece_name, x):
    if piece_name not in PIECES:
        ...
    if not isinstance(x, int):
        ...
    # core logic mixed with validation
```

Better:

```python
def parse_move(token: str) -> Move:
    piece_name = token[0]
    x_text = token[1:]

    if piece_name not in PIECES:
        raise ValueError(f"Unknown piece: {piece_name}")

    if not x_text.isdigit():
        raise ValueError(f"Invalid x position: {x_text}")

    return Move(piece_name=piece_name, x=int(x_text))
```

Then the core logic receives clean data:

```python
move = parse_move(token)
board.drop(PIECES[move.piece_name], move.x)
```

Why this matters:

- Parsing and validation are isolated.
- Core logic stays simpler.
- Invalid input fails early.
- Tests are easier to write.

Use clear exceptions like `raise ValueError("Invalid board width")` or `raise KeyError("Unknown piece")` — but prefer `ValueError` for invalid user/input values.

## 11. Use exceptions intentionally

Python uses exceptions for error handling. Use them clearly.

Good:

```python
if x < 0 or x >= self.width:
    raise ValueError(f"x position {x} is outside board width {self.width}")
```

Bad:

```python
try:
    # huge block of code
except:
    pass
```

Never silently swallow errors unless you have a very specific reason. Bad:

```python
try:
    result = process(input_data)
except Exception:
    return None
```

Better:

```python
try:
    result = process(input_data)
except ValueError as error:
    raise ValueError(f"Failed to process input: {error}") from error
```

Why this matters:

- Silent failures hide bugs.
- Broad exceptions hide the real cause.
- Specific exceptions make debugging easier.

Rule of thumb:

- Raise errors when the caller gave invalid input.
- Handle errors when you can actually recover.
- Let unexpected errors surface during development.

## 12. Use comments and docstrings for intent, not noise

Python supports docstrings:

```python
def clear_rows(self) -> None:
    """Remove completed rows and shift rows above them downward."""
```

Good comments explain why:

```python
# Rebuild occupied cells so rows above cleared rows shift down consistently.
```

Bad comments repeat what the code already says:

```python
# Add one to x
x += 1
```

A useful docstring explains what the function does, important assumptions, the return value, and important side effects.

```python
def can_place(self, piece: Piece, x: int, y: int) -> bool:
    """Return whether the piece can be placed at the given board position.

    The position represents the bottom-left origin of the piece.
    """
```

Do not over-document obvious helper functions. But for public methods, tricky logic, or assessment submissions, a short docstring helps.

## 13. Format code automatically

Use a formatter — `ruff format`, `black`, or `isort`.

Use a linter — `ruff`, `flake8`, or `pylint`.

Use a type checker when useful — `mypy` or `pyright`.

Why this matters:

- Formatting should not be a debate.
- Linters catch simple mistakes.
- Consistent style makes the code easier to review.

For interviews and assessments, clean formatting signals care.

## 14. Write tests with meaningful cases

Python tests are often written with `pytest` or `unittest`. For take-home work, `pytest` is usually simple and readable.

```python
def test_empty_input_returns_zero_height():
    assert solve("") == 0

def test_full_row_clears():
    assert solve("Q0 Q2 Q4 Q6 Q8") == 0
```

Good tests cover the normal case, empty input, invalid input, boundary position, multiple operations, multiple row clears, state after clearing, and regression cases.

Example Tetris-style test list:

- empty input returns 0
- single square returns height 2
- pieces stack correctly
- full row clears
- multiple rows clear together
- piece at left wall works
- piece at right wall works
- invalid piece raises `ValueError`
- invalid x position raises `ValueError`

Why this matters:

- Tests show how the code is expected to behave.
- Tests protect future refactors.
- Tests reveal whether you considered edge cases.

Do not only test the sample input.

## 15. Prefer explicit code over magical code

Python allows very compact expressions. Compact is not always better.

Clever but hard to read:

```python
result = [f(x) for x in xs if g(x) and h(x) or k(x)]
```

Better:

```python
result = []

for x in xs:
    if should_include(x):
        result.append(transform(x))
```

List comprehensions are good when simple:

```python
squares = [x * x for x in numbers]
```

But when logic has multiple conditions, side effects, or error handling, use normal loops. Readable Python is more impressive than overly clever Python.

## 16. Use classes when state and behavior belong together

Do not use classes just because they look "professional." Use a class when there is state that changes over time, there are operations that naturally belong to that state, you want to protect invariants, or the concept exists in the problem domain.

Good class candidate:

```python
class Board:
    def __init__(self, width: int) -> None:
        self.width = width
        self.occupied: set[tuple[int, int]] = set()

    def drop(self, piece: Piece, x: int) -> None:
        ...

    def height(self) -> int:
        ...
```

`Board` makes sense because it owns board state and board behavior.

Bad class:

```python
class TetrisHelperManager:
    ...
```

if it only contains random unrelated functions.

**Trade-off:** Simple functions are often enough. Use classes when they make ownership clearer.

## 17. Be careful with mutation

Python objects are often mutable: `list`, `dict`, `set`, class instances. Mutation is useful, but uncontrolled mutation creates bugs.

Bad — this mutates while iterating and can cause bugs:

```python
def remove_full_rows(rows):
    for row in rows:
        if is_full(row):
            rows.remove(row)
```

Better:

```python
def remove_full_rows(rows):
    return [row for row in rows if not is_full(row)]
```

For stateful objects, mutation can be fine if ownership is clear:

```python
class Board:
    def clear_rows(self) -> None:
        self.occupied = self._build_cells_after_clear()
```

Rule of thumb:

- Mutate inside the object that owns the state.
- Avoid surprising mutation of objects passed into functions.

## 18. Use modules to organize code

As code grows, avoid putting everything in one file.

Small assessment:

```text
tetris.py
test_tetris.py
README.md
```

Larger project:

```text
tetris/
    __init__.py
    board.py
    piece.py
    parser.py
    engine.py
tests/
    test_board.py
    test_parser.py
```

Do not split too early. For a small take-home assignment, one clean file plus tests can be enough. Good organization means the reader can find things easily.

## 19. Think about performance using Python-friendly structures

Python is not the fastest language for tight loops, but good data structures matter.

```python
occupied: set[tuple[int, int]]
```

This gives fast membership checks:

```python
if (x, y) in occupied:
    return False
```

Avoid repeated full scans if a dictionary or set would express the same logic better.

Good Python performance thinking:

- Use `set`/`dict` for fast lookup.
- Avoid unnecessary nested loops.
- Avoid repeated work inside loops.
- Keep the algorithm simple.
- Mention complexity where useful.

Example explanation:

> The board is stored as occupied cells in a set. Collision checks are O(number of cells in the piece), because each cell lookup is constant time on average. Row clearing rebuilds the occupied set after removing full rows. This is efficient enough because each Tetris piece has a small fixed number of cells.

**Trade-off:** Do not write unreadable Python just to micro-optimize. Clear algorithmic choices matter more than clever tricks.

## 20. Design for reasonable extension

Python code should be easy to change when requirements shift.

Bad — logic spread across many functions:

```python
if piece_name == "Q":
    # square logic
elif piece_name == "I":
    # line logic
elif piece_name == "T":
    # T logic
```

Better:

```python
PIECES = {
    "Q": Piece("Q", ((0, 0), (1, 0), (0, 1), (1, 1))),
    "I": Piece("I", ((0, 0), (1, 0), (2, 0), (3, 0))),
    "T": Piece("T", ((0, 0), (1, 0), (2, 0), (1, 1))),
}
```

Then the board logic only needs to know: here are the cells, can they fit?

If tomorrow the board width changes: `board = Board(width=12)`.

If tomorrow a new piece is added: `PIECES["X"] = Piece("X", ...)`.

If tomorrow rotations are added, the shape model can evolve:

```python
@dataclass(frozen=True)
class Piece:
    name: str
    rotations: dict[int, tuple[tuple[int, int], ...]]
```

Good design localizes change.

**Trade-off:** Do not build a full plugin architecture for a small assignment. Support likely changes, not imaginary ones.

## 21. Write a short README for assessments

For a Python take-home assessment, include a README. A strong README has a problem summary, approach, how to run, how to test, assumptions, edge cases, and complexity.

Example approach:

> I represent the board as a set of occupied (x, y) cells. Each piece is represented as relative coordinates from its origin. To drop a piece, I move it downward until the next position would collide with the floor or occupied cells. After placing a piece, I remove completed rows and shift rows above them down. The final height is the highest occupied y-coordinate plus one.

This helps the reviewer understand your design before reading the code. No high-level explanation can make working code feel less impressive.

## 22. Python assessment checklist

Before submitting Python code, review the following, grouped by area.

### Correctness and validation

- Are invalid inputs handled explicitly?
- Are tests covering edge cases?

### Structure and design

- Are meaningful domain concepts represented clearly?
- Are functions small and focused?
- Is the main flow easy to find?
- Are constants/configuration centralized?
- Are there unnecessary globals?

### Types and data

- Are important functions type hinted?
- Are data structures appropriate?

### Naming and style

- Does the code use `snake_case` and normal Python naming?
- Are classes `PascalCase` and constants `UPPER_CASE`?
- Is the code formatted consistently?

### Maintainability

- Are comments explaining why, not repeating what?
- Can likely changes be made safely?
- Is there a short README explaining the approach?

### Performance

- Is performance reasonable for the expected input?

## Final principle

Good Python does not try to look complicated. Good Python makes the problem feel simple.

The strongest Python code is usually clear, small, typed where useful, tested, idiomatic, explicit, and easy to extend.

For interviews and take-home assessments, the goal is not just "the code works." The goal is that the reviewer can trust this code — and trust the engineer who wrote it.
