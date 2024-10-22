<?php 
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     title="Usuário",
 *     required={"name", "email", "cpf", "nivel_acesso"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Nome do Usuário"),
 *     @OA\Property(property="email", type="string", format="email", example="usuario@email.com"),
 *     @OA\Property(property="cpf", type="string", example="123.456.789-00"),
 *     @OA\Property(property="nivel_acesso", type="integer", example=3),
 *     @OA\Property(property="created_at", type="string", example="2024-10-16T15:51:05.000000Z"),
 *     @OA\Property(property="updated_at", type="string", example="2024-10-16T15:51:05.000000Z")
 * )
 */

class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/users",
     *     summary="Listar Usuários",
     *     description="Retorna uma lista de todos os usuários.",
     *     tags={"Usuário"},
     *     security={{ "sanctum": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de usuários retornada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/User")
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $users = User::all();
        return response()->json(['status' => 'success', 'data' => $users], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/users",
     *     summary="Criar Usuário",
     *     description="Cria um novo usuário.",
     *     tags={"Usuário"},
     *     security={{ "sanctum": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "cpf", "nivel_acesso"},
     *             @OA\Property(property="name", type="string", example="Nome Usuário"),
     *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com"),
     *             @OA\Property(property="cpf", type="string", example="123.456.789-00"),
     *             @OA\Property(property="nivel_acesso", type="integer", example=1),
     *             @OA\Property(property="password", type="string", format="password", example="senhaSegura123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuário criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Usuário criado com sucesso"),
     *             @OA\Property(property="data", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Erro de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Erro de Validação"),
     *             @OA\Property(property="erros", type="object",
     *                 @OA\Property(property="email", type="array", @OA\Items(type="string", example="Este email já foi cadastrado"))
     *             )
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validateUser = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'cpf' => 'required|unique:users,cpf',
            'nivel_acesso' => 'required|integer|between:1,5',
            'password' => 'required',
        ]);

        if ($validateUser->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro de validação',
                'erros' => $validateUser->errors()
            ], 401);
        }

        // Remover pontos e traços do CPF
        $cpfLimpo = preg_replace('/\D/', '', $request->cpf);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'cpf' => $cpfLimpo,
            'nivel_acesso' => $request->nivel_acesso,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Usuário criado com sucesso', 'data' => $user], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}",
     *     summary="Atualizar Usuário",
     *     description="Atualiza as informações de um usuário.",
     *     tags={"Usuário"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Nome Usuário"),
     *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com"),
     *             @OA\Property(property="cpf", type="string", example="123.456.789-00"),
     *             @OA\Property(property="nivel_acesso", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuário atualizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Usuário atualizado com sucesso"),
     *             @OA\Property(property="data", ref="#/components/schemas/User")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validateUser = Validator::make($request->all(), [
            'name' => 'sometimes|required',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'cpf' => 'sometimes|required|unique:users,cpf,' . $id,
            'nivel_acesso' => 'sometimes|required|integer|between:1,5',
        ]);

        if ($validateUser->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro de validação',
                'erros' => $validateUser->errors()
            ], 401);
        }

    // Remover pontos e traços do CPF
    $cpfLimpo = isset($request->cpf) ? preg_replace('/\D/', '', $request->cpf) : $user->cpf;

    // Atualizar o usuário com o CPF limpo
    $user->update([
        'name' => $request->name,
        'email' => $request->email,
        'cpf' => $cpfLimpo,
        'nivel_acesso' => $request->nivel_acesso
    ]);

        return response()->json(['status' => 'success', 'message' => 'Usuário atualizado com sucesso', 'data' => $user], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     summary="Deletar Usuário",
     *     description="Remove um usuário do sistema.",
     *     tags={"Usuário"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuário deletado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Usuário deletado com sucesso")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['status' => 'success', 'message' => 'Usuário deletado com sucesso'], 200);
    }
}
