/**
 * 以 Atom 为基本框架写的代码具备以下特性：
 *
 *   - 存在且能够用明确的流程图表示出来，这种流程可以用视图、代码等方式呈现，且可以在多种呈现方式之间进行转换。
 *   - 逻辑流程和实际代码可以相互转换，但二者是不同的，逻辑流程需要转换为实际代码之后才能够运行。
 *   - 实际代码和代码实例可以相互转换，但二者是不同的，代码需要使用 eval 或者 Function 等方式转换为代码实例才能够运行。
 *     - 实际代码中可能有危险代码，所以「实际代码 -> 代码实例」的转换最好在沙盒环境中进行，相应的代码实例的执行也在沙盒环境中进行。
 *     - 「代码实例 -> 实际代码」的转换可以在任何环境中进行。
 *   - 逻辑流程和实际低码相互转换的介质是 AST，在这个层面上还将完成流程分析和优化、调试相关变量注入、依赖模块注入等操作。
 *
 *   - Atom 的本质是一种声明式的程序控制结构，因为它不像命令式那么琐碎，所以能够实现视图和代码的统一，天生就适合 LowCode、NoCode。
 *   - Atom 的实现并不依赖特定于语言的特性，凡是支持函数式的语言都可以实现 Atom，这意味着可以有 PyAtom、HaskellAtom 等。
 *   - 同一套逻辑流程，可以转换为多种语言实现，这意味着存在以下链路：「视图编辑 -> 逻辑流程 -> 多种语言实现」，逻辑流程抽象之后，就是一门新的语言。
 *   - 由于逻辑流程是一致的，意味着程序的不同部分可以转换到不同的语言执行：
 *     - 比如一个网页应用，交互、视图、基本业务逻辑等可以在游览器中使用 JSAtom 执行，科学计算和 AI 等可以使用 PyAtom 执行、而对安全性较为苛刻的操作，可以交给 HaskellAtom 执行。
 */
export {}
