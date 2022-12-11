# Advent of Code 2022

- `yarn run day1` etc


## Notes

Day 1- A fun, easy start

Day 2 - Quite easy again. Made sense to hard-code the round outcomes, since there's only 3 options.

Day 3 - A bit more code needed this time, but again it wasn't too hard. Part 2 was quite easy to adapt to.

Day 4 - Bit more challenging here. I went for a "dumb" memory-heavy approach which made the rest of the implementation quite easy. There was other options available, but they seemed harder. Was pleased when it turned out to be a good choice.

Day 5 - Supply stacks: this wasn't too bad, using a `Map` to represent the stacks (columns) seemed sensible. It worked well. Part 2 was really easy since my part 1 solution just needed to wrap a `reverse()` statement with a conditional.

Day 6 - Really easy. Deferred uniqueness-detection to simply using a `Set`, which is a pattern I have enjoyed using in recent times.

Day 7 - Test case passing, input data not. Difficult to hand-craft something that causes the problem. Might be related to nested dirs with the same name, can't remember.

Day 9 - Part 1 was OK but I struggled with part 2. Outputting the visual output was kinda useful. IIRC the movement algo had to change to allow for 2x2 moves. It was difficult keeping track of everything, since every move meant 10 * `number in move` simulations in a chain, plus start cases.

Day 10 -
