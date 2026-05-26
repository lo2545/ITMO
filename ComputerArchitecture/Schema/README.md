# Микрокодовые команды процессора

## Чтение памяти

| Команда | Описание | Микродействия |
|---------|----------|----------------|
| `@p`    | читать `MEM[P]`, `P++` | `MUX_addr.sel = 00` → `MEM.addr ← P`<br>`MEM_rd = 1` → `MEM.data_out → MUX_T`<br>`MUX_T.sel = 000` → `T ← MEM.data_out`<br>`T.wr = 1`<br>`P.inc = 1` → `P ← P + 1` |
| `@+`    | читать `MEM[A]`, `A++` | `MUX_addr.sel = 01` → `MEM.addr ← A`<br>`MEM_rd = 1` → `MEM.data_out → MUX_T`<br>`MUX_T.sel = 000` → `T ← MEM.data_out`<br>`T.wr = 1`<br>`A.inc = 1` → `A ← A + 1` |
| `@b`    | читать `MEM[B]` | `MUX_addr.sel = 10` → `MEM.addr ← B`<br>`MEM_rd = 1` → `MEM.data_out → MUX_T`<br>`MUX_T.sel = 000` → `T ← MEM.data_out`<br>`T.wr = 1` |
| `@`     | читать `MEM[A]` | `MUX_addr.sel = 01` → `MEM.addr ← A`<br>`MEM_rd = 1` → `MEM.data_out → MUX_T`<br>`MUX_T.sel = 000` → `T ← MEM.data_out`<br>`T.wr = 1` |

---

##  Запись памяти

| Команда | Описание | Микродействия |
|---------|----------|----------------|
| `!p`    | писать `T` → `MEM[P]`, `P++` | `MUX_addr.sel = 00` → `MEM.addr ← P`<br>`T → MEM.data_in`<br>`MEM_wr = 1` → `MEM[P] ← T`<br>`MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1`<br>`P.inc = 1` → `P ← P + 1` |
| `!+`    | писать `T` → `MEM[A]`, `A++` | `MUX_addr.sel = 01` → `MEM.addr ← A`<br>`T → MEM.data_in`<br>`MEM_wr = 1` → `MEM[A] ← T`<br>`MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1`<br>`A.inc = 1` → `A ← A + 1` |
| `!b`    | писать `T` → `MEM[B]` | `MUX_addr.sel = 10` → `MEM.addr ← B`<br>`T → MEM.data_in`<br>`MEM_wr = 1` → `MEM[B] ← T`<br>`MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1` |
| `!`     | писать `T` → `MEM[A]` | `MUX_addr.sel = 01` → `MEM.addr ← A`<br>`T → MEM.data_in`<br>`MEM_wr = 1` → `MEM[A] ← T`<br>`MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1` |

---

## Команды ALU

| Команда | Описание | Микродействия |
|---------|----------|----------------|
| `+`     | `T ← S + T`, drop S | `ALU_op = 000` → `ALU.result ← S + T`<br>`MUX_T.sel = 001` → `T ← ALU.result`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1`<br>`C.wr = 1` → `C ← ALU.cout` |
| `and`   | `T ← S & T`, drop S | `ALU_op = 001` → `ALU.result ← S & T`<br>`MUX_T.sel = 001` → `T ← ALU.result`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1` |
| `or`    | `T ← S ^ T`, drop S | `ALU_op = 010` → `ALU.result ← S ^ T`<br>`MUX_T.sel = 001` → `T ← ALU.result`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1` |
| `not`   | `T ← ~T` | `ALU_op = 011` → `ALU.result ← ~T`<br>`MUX_T.sel = 001` → `T ← ALU.result`<br>`T.wr = 1` |
| `2*`    | `T ← T << 1` | `ALU_op = 100` → `ALU.result ← T << 1`<br>`MUX_T.sel = 001` → `T ← ALU.result`<br>`T.wr = 1`<br>`C.wr = 1` → `C ← ALU.cout` |
| `2/`    | `T ← T >> 1` (arithmetic) | `ALU_op = 101` → `ALU.result ← T >> 1`<br>`MUX_T.sel = 001` → `T ← ALU.result`<br>`T.wr = 1` |
| `+*`    | один шаг умножения | `ALU_op = 110` → если `T[0]=1`: `ALU.result ← (S + A) >> 1`<br>если `T[0]=0`: `ALU.result ← A >> 1`<br>`MUX_T.sel = 001` → `T ← ALU.result`<br>`T.wr = 1`<br>`C.wr = 1` → `C ← ALU.cout` |

---

## Стек данных

| Команда | Описание | Микродействия |
|---------|----------|----------------|
| `dup`   | push T | `Data_Stack.push = 1` → `Data_Stack ← S`<br>`MUX_S.sel = 01` → `S ← T`<br>`S.wr = 1` |
| `drop`  | убрать T | `MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1` |
| `over`  | push S | `Data_Stack.push = 1` → `Data_Stack ← S`<br>`MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 01` → `S ← T`<br>`S.wr = 1` |

---

##  Возвратный стек

| Команда | Описание | Микродействия |
|---------|----------|----------------|
| `push`  | `R ← T`, drop T | `MUX_R.sel = 10` → `R ← T`<br>`R.wr = 1`<br>`Return_Stack.push = 1` → `Return_Stack ← R_old`<br>`MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1` |
| `pop`   | `T ← R`, drop R | `MUX_T.sel = 011` → `T ← R` (zero-ext)<br>`T.wr = 1`<br>`Data_Stack.push = 1` → `Data_Stack ← S`<br>`MUX_S.sel = 01` → `S ← T_old`<br>`S.wr = 1`<br>`MUX_R.sel = 01` → `R ← Return_Stack.out`<br>`R.wr = 1`<br>`Return_Stack.pop = 1` |

---

## Адресные регистры

| Команда | Описание | Микродействия |
|---------|----------|----------------|
| `a`     | push A | `Data_Stack.push = 1` → `Data_Stack ← S`<br>`MUX_S.sel = 01` → `S ← T`<br>`S.wr = 1`<br>`MUX_T.sel = 100` → `T ← A` (zero-ext)<br>`T.wr = 1` |
| `a!`    | `A ← T`, drop T | `A.wr = 1` → `A ← T[8:0]`<br>`MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1` |
| `b!`    | `B ← T`, drop T | `B.wr = 1` → `B ← T[8:0]`<br>`MUX_T.sel = 010` → `T ← S`<br>`T.wr = 1`<br>`MUX_S.sel = 00` → `S ← Data_Stack.out`<br>`S.wr = 1`<br>`Data_Stack.pop = 1` |

---

## Управление потоком

| Команда | Описание             | Микродействия |
|---------|----------------------|----------------|
| `call`  | вызов подпрограммы   | `Return_Stack.push = 1` → `Return_Stack ← R`<br>`MUX_R.sel = 00` → `R ← P`<br>`R.wr = 1`<br>`MUX_PC.sel = 01` → `P ← IR[8:0]`<br>`P.wr = 1` |
| `return`| возврат              | `MUX_PC.sel = 10` → `P ← R`<br>`P.wr = 1`<br>`MUX_R.sel = 01` → `R ← Return_Stack.out`<br>`R.wr = 1`<br>`Return_Stack.pop = 1` |
| `ex`    | swap P и R           | `MUX_PC.sel = 10` → `P ← R`<br>`P.wr = 1`<br>`MUX_R.sel = 00` → `R ← P_old`<br>`R.wr = 1` |
| `jump`  | безусловный переход  | `MUX_PC.sel = 01` → `P ← IR[8:0]`<br>`P.wr = 1` |
| `if`    | переход если `T = 0` | если `ALU.zero = 1`:<br>&nbsp;&nbsp;`MUX_PC.sel = 01` → `P ← IR[8:0]`<br>&nbsp;&nbsp;`P.wr = 1`<br>иначе: `P` не меняется |
| `-if`   | переход если `T < 0` | если `ALU.neg = 1`:<br>&nbsp;&nbsp;`MUX_PC.sel = 01` → `P ← IR[8:0]`<br>&nbsp;&nbsp;`P.wr = 1`<br>иначе: `P` не меняется |
| `next`  | цикл со счётчиком R  | если `R ≠ 0`:<br>&nbsp;&nbsp;`MUX_R.sel = 11` → `R ← R - 1`<br>&nbsp;&nbsp;`R.wr = 1`<br>&nbsp;&nbsp;`MUX_PC.sel = 01` → `P ← IR[8:0]`<br>&nbsp;&nbsp;`P.wr = 1`<br>если `R = 0`:<br>&nbsp;&nbsp;`MUX_R.sel = 01` → `R ← Return_Stack.out`<br>&nbsp;&nbsp;`R.wr = 1`<br>&nbsp;&nbsp;`Return_Stack.pop = 1`<br>&nbsp;&nbsp;`P` не меняется → выход из цикла |
| `unext` | с счётчиком R        | если `R ≠ 0`:<br>&nbsp;&nbsp;`MUX_R.sel = 11` → `R ← R - 1`<br>&nbsp;&nbsp;`R.wr = 1`<br>&nbsp;&nbsp;`MUX_PC.sel = 10` → `P ← R_old`<br>&nbsp;&nbsp;`P.wr = 1`<br>если `R = 0`:<br>&nbsp;&nbsp;`MUX_R.sel = 01` → `R ← Return_Stack.out`<br>&nbsp;&nbsp;`R.wr = 1`<br>&nbsp;&nbsp;`Return_Stack.pop = 1`<br>&nbsp;&nbsp;`P` не меняется → выход |