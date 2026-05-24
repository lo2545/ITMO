variable fib_a
variable fib_b
variable fib_tmp
variable fib_sum

: even?
    2 mod 0 =
;

: fib_step
    fib_b @ fib_tmp !
    fib_a @ fib_b @ + fib_b !
    fib_tmp @ fib_a !
;

: check_add
    fib_b @ even?
    if
        fib_sum @ fib_b @ + fib_sum !
    then
;

: done?
    fib_b @ 4000000 <
    not
;

: main
    1 fib_a !
    2 fib_b !
    2 fib_sum !
    begin
        fib_step
        check_add
        done?
    until
    fib_sum @ __print_int
    halt
;
