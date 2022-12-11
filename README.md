# Advent of Code 2022

- `yarn run day1` etc


## Approach

I have opted to use TypeScript, using a functional style, most (if not all) solutions will contain only pure functions.

My priorities are:

1) Solve the puzzle, as fast as possible
2) Make it reasonably readable
3) Make it performant

In other words, I've not focused on performance here. There are numerous cases of inefficient code, since performance is low on my priorities.

## Notes

Day 1 - A fun, easy start

Day 2 - Quite easy again. Made sense to hard-code the round outcomes, since there's only 3 options.

Day 3 - A bit more code needed this time, but again it wasn't too hard. Part 2 was quite easy to adapt to.

Day 4 - Bit more challenging here. I went for a "dumb" memory-heavy approach which made the rest of the implementation quite easy. There was other options available, but they seemed harder. Was pleased when it turned out to be a good choice.

Day 5 - Supply stacks: this wasn't too bad, using a `Map` to represent the stacks (columns) seemed sensible. It worked well. Part 2 was really easy since my part 1 solution just needed to wrap a `reverse()` statement with a conditional.

Day 6 - Really easy. Deferred uniqueness-detection to simply using a `Set`, which is a pattern I have enjoyed using in recent times.

Day 7 - Hard one. Test case passing, input data not. Difficult to hand-craft something that causes the problem. Might be related to nested dirs with the same name, can't remember.

Day 8 - A bit tricky with having to invert the direction with 2 axis. Pleased with how it came out, a set of quite succint functions.

Day 9 - Hard one. Part 1 was OK but I struggled with part 2. Outputting the visual output was kinda useful. IIRC the movement algo had to change to allow for 2x2 moves. It was difficult keeping track of everything, since every move meant 10 * `number in move` simulations in a chain, plus start cases.

Day 10 - Part 1 was fun and quite easy. At first I was just looping the instructions but soon realised I had to introduce extra cycles to account for how the register works. Part 2 wasn't too hard, although I did have an off-by-one error (AGAIN!) that was messing up my test output. Luckily it didn't take too long to fix. This was probably my favourite one so far!

